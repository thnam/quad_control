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
std::vector<std::string> state = {"ACTIVE", "PROPOSED"};

std::vector<std::string> params { "ENABLE_2STEP",
  "CHARGE_START", "CHARGE_END", "STEP1_END", "STEP2_START",
  "DISCHARGE_START", "DISCHARGE_END" };

g2quad * quad;
void readPulserSettings(unsigned int chn = 1);

int main(int argc, char *argv[])
{
  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string ipAddress("192.168.30.89");
  quad = new g2quad(addressTable, ipAddress);

  std::map<std::string, uint32_t> setting;
  setting[params[0]] = 0;
  setting[params[1]] = 10;
  setting[params[2]] = 77510;
  setting[params[3]] = setting["CHARGE_START"] + 3000; // random number, anything between 500 and 80k should do
  setting[params[4]] = setting["STEP1_END"] + 500; // constrained, >= 500
  setting[params[5]] = 78010;
  setting[params[6]] = 148010;

  char tmpStr[120];
  sprintf(tmpStr, "ADCBOARD.2.FP_PULSER.");
  std::string const base(tmpStr);
  for (int i = 0; i < 6; ++i) {
    quad->Write(base + "PROPOSED." + params[i], setting[params[i]]);
  }
  quad->Write(base + "ENABLE", 1);

  std::cout << "Status " << quad->Read(base + "STATUS") << std::endl;
  uint32_t error =  quad->Read(base +  "ERROR");
  std::bitset<8> x(error);
  std::cout << "Error " << quad->Read(base + "ERROR") << " = " << x << std::endl;
  readPulserSettings(2);

  // for (int i = 0; i < 4; ++i) {
    // readPulserSettings(i + 1);
  // }

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
