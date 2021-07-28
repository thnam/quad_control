#include <string>
#include <locale>         // std::locale, std::toupper
#include <vector>
#include <map>
#include <iostream>
#include <sstream>
#include <stdlib.h>
#include <cstdlib>
#include <bitset>

#include <future>         // std::async, std::future
#include <chrono>         // std::chrono::milliseconds
#include <thread>

#include <getopt.h>

#include "g2quad/g2quad.hh"
#include "BoardMap.h"

g2quad * quad;
BoardMap bm;

std::vector<std::string> state = {"ACTIVE", "PROPOSED"};
std::vector<std::string> params { "ENABLE_2STEP",
  "CHARGE_START", "CHARGE_END", "STEP1_END", "STEP2_START",
  "DISCHARGE_START", "DISCHARGE_END" };

void showUsage(char * name);
void readPulserSettings(unsigned int chn = 1);

int main(int argc, char *argv[])
{
  // check arguments, only accept 2 cases
  if (!(argc==6 || argc==8)) {
    std::cerr << "Invalid arguments" << std::endl;
    showUsage(argv[0]);
    return -1;
  }

  // open a connection
  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string topZynqIpAddress("192.168.30.180");
  std::string botZynqIpAddress("192.168.30.181");

  std::map<std::string, uint32_t> setting;
  int32_t chn = atoi(argv[1]);
  if (argc == 6) {
    setting["ENABLE_2STEP"] = 0;
    setting["CHARGE_START"] = atoi(argv[2]) / 10;
    setting["CHARGE_END"] = atoi(argv[3])/10 + setting["CHARGE_START"];
    setting["STEP1_END"] = setting["CHARGE_START"] + 3000; // random number, anything between 500 and 80k should do
    setting["STEP2_START"] = setting["STEP1_END"] + 500; // constrained, >= 500
    setting["DISCHARGE_START"] = atoi(argv[4]) / 10;
    setting["DISCHARGE_END"] = atoi(argv[5]) / 10 + setting["DISCHARGE_START"];
  }
  else if (argc == 8){
    setting["ENABLE_2STEP"] = 1;
    setting["CHARGE_START"] = atoi(argv[2]) / 10;
    setting["STEP1_END"] = atoi(argv[3])/10 + setting["CHARGE_START"];
    setting["STEP2_START"] = atoi(argv[4]) / 10;
    setting["CHARGE_END"] = setting["STEP2_START"] + atoi(argv[5]) / 10;
    setting["DISCHARGE_START"] = atoi(argv[6]) / 10;
    setting["DISCHARGE_END"] = atoi(argv[7]) / 10 + setting["DISCHARGE_START"];
  }

  // stop pulsing, disable pulser, config, check, then enable pulser
  char tmpStr[120];
  sprintf(tmpStr, "ADCBOARD.%d.FP_PULSER.", chn);
  std::string const base(tmpStr);

  bm = readBoardMap();
  try {
    if (std::find(bm["top"].begin(), bm["top"].end(), chn) != bm["top"].end()) 
      quad = new g2quad(addressTable, topZynqIpAddress);
    else if (std::find(bm["bot"].begin(), bm["bot"].end(), chn) != bm["bot"].end()) 
      quad = new g2quad(addressTable, botZynqIpAddress);
  }catch(const std::exception & e) {
    std::cerr << "Could not connect to the Zynq at " << topZynqIpAddress <<
      " or at " << botZynqIpAddress << std::endl;
    std::cerr<< e.what() << std::endl;
    return -1;
  }

  quad->Write("TRIGGER.FREE_RUN.ENABLE", 0);
  quad->Write(base + "ENABLE", 0);
  std::this_thread::sleep_for(std::chrono::milliseconds(500));

  for (uint32_t i = 0; i < setting.size(); ++i) {
    quad->Write(base + "PROPOSED." + params[i], setting[params[i]]);
  }


  uint32_t status = quad->Read(base + "STATUS");
  if (status == 0) { // all good
    quad->Write(base + "ENABLE", 1);
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
    quad->Write("TRIGGER.FREE_RUN.ENABLE", 1);
  }
  else {
    uint32_t error =  quad->Read(base +  "ERROR");
    std::bitset<8> x(error);
    std::cerr << "Could not config pulser as requested, error flags: "
      << error << " = " << x << std::endl;

    char const* const ERROR_FLAGS[7] = {
      "charge_start or charge2_ start is zero\n",
      "charge_start > 100000ns\n",
      "charge1_duration is >800000 or <5000\n",
      "charge1_end-charge2_start is < 5000\n",
      "charge2_duration is <5000 or >300000000\n",
      "discharge_start-charge2_end is >2000000\n",
      "discharge_duration is >2000000 or <500000\n"};
    for(size_t iBit=0; iBit<7;iBit++){
      if(error&(1<<iBit)){
        fprintf(stderr,"%s",ERROR_FLAGS[iBit]);
      } 
    }

    return -1;
  }
  // readPulserSettings(chn);
  return 0;
}

void readPulserSettings(unsigned int chn){
  char tmpStr[120];
  sprintf(tmpStr, "ADCBOARD.%d.FP_PULSER.", chn);
  std::string prefix0(tmpStr);

  std::cout << "-------------------------------------------------" << std::endl;

  std::cout << "Pulser " << chn << "\t |\t" << state.at(0)  << " (ns)"
    << "\t|\t" << state.at(1)  << " (ns)"<< std::endl;
  for (std::string param : params){
    unsigned int ret0 = 10 * (quad->Read(prefix0 + state.at(0) + "." + param));
    unsigned int ret1 = 10 * (quad->Read(prefix0 + state.at(1) + "." + param));
    std::cout << param << "\t |\t" << ret0 << "\t\t|\t" << ret1  
      << std::endl;
  }
  std::cout << "-------------------------------------------------" << std::endl;
}

void showUsage(char * name){
  std::cout << "Usage:" << std::endl;
  std::cout << "\t- 1-step pulser: "<< std::string(name) << " channel "
    << "chargeStart chargeDuration dischargeStart dischargeDuration (in ns)"
    << std::endl;
  std::cout << "\t- 2-step pulser: "<< std::string(name) << " channel "
    << "chargeStart step1Duration step2Start step2Duration "
    <<"dischargeStart dischargeDuration (in ns)"
    << std::endl;
}
