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

g2quad * quad;
void readPulserSettings(unsigned int chn = 1);
std::string PulserSettingsJson(unsigned int chn = 1);
std::string readRFSettings(unsigned int chn);

int main(int argc, char *argv[])
{
  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string ipAddress("192.168.30.89");

  quad = new g2quad(addressTable, ipAddress);

  std::cout << "{\"Pulser\":{";
  for (int i = 0; i < 4; ++i) {
    std::cout << PulserSettingsJson(1 + i);

    if (i == 3) 
      std::cout << "},";
    else
      std::cout << ",";
  }

  std::cout << "\"RF\":{";
  for (int i = 0; i < 4; ++i) {
    std::cout << readRFSettings(i + 1); 
    if (i == 3) 
      std::cout << "}}";
    else
      std::cout << ",";
  }
  std::cout << std::endl;

  return 0;
}


std::string PulserSettingsJson(unsigned int chn){
  char tmpStr[120];
  sprintf(tmpStr, "ADCBOARD.%d.FP_PULSER.", chn);
  std::string prefix0(tmpStr);
  std::vector<std::string> prefix1 = {"ACTIVE", "PROPOSED"};

  std::vector<std::string> params {"CHARGE_END", "CHARGE_START",
    "DISCHARGE_START", "DISCHARGE_END", "ENABLE_2STEP", "STEP1_END",
    "STEP2_START"};
  std::map<std::string, std::map<std::string, uint32_t> > setting;

  for (auto param : params){
    std::string key = prefix0 + prefix1.at(0) + "." + param;
    unsigned int ret0 = 10 * (quad->Read(key));

    key = prefix0 + prefix1.at(1) + "." + param;
    unsigned int ret1 = 10 * (quad->Read(key));
    if (param != "ENABLE_2STEP"){
      setting[prefix1.at(0)][param] = ret0;
      setting[prefix1.at(1)][param] = ret1;
    } 
    else{
      setting[prefix1.at(0)][param] = ret0/10;
      setting[prefix1.at(1)][param] = ret1/10;
    }
  }

  std::stringstream os;
  os << "\"" << chn <<"\":{";
  for (auto i : setting) {
    os << "\"" << i.first <<"\":{";
    for (auto j : i.second){
      os << "\"" << j.first <<"\":" << j.second << ",";
    }
    os.seekp(-1, std::ios_base::end);
    os << "},";
  }

  os.seekp(-1, std::ios_base::end);
  os << "}";
  return os.str();
}

void readPulserSettings(unsigned int chn){
  char tmpStr[120];
  sprintf(tmpStr, "ADCBOARD.%d.FP_PULSER.", chn);
  std::string prefix0(tmpStr);
  std::vector<std::string> prefix1 = {"ACTIVE.", "PROPOSED."};

  std::string subPrefix = "ACTIVE.";

  std::cout << "-------------------------------------------------" << std::endl;
  std::vector<std::string> params {"CHARGE_END", "CHARGE_START",
    "DISCHARGE_START", "DISCHARGE_END", "ENABLE_2STEP", "STEP1_END",
    "STEP2_START"};

  std::cout << "Pulser " << chn << "\t |\t" << prefix1.at(0)  << " (ns)"
    << "\t|\t" << prefix1.at(1)  << " (ns)"<< std::endl;
  for (std::string param : params){
    unsigned int ret0 = 10 * (quad->Read(prefix0 + prefix1.at(0) + param));
    unsigned int ret1 = 10 * (quad->Read(prefix0 + prefix1.at(1) + param));
    std::cout << param << "\t |\t" << ret0 << "\t\t|\t" << ret1  
      << std::endl;
  }
  std::cout << "-------------------------------------------------" << std::endl;

}

std::string readRFSettings(unsigned int chn){
  char base[120];
  char reg[256];
  sprintf(base, "ADCBOARD.%d.FP_RF_PULSER", chn);

  std::stringstream os;
  os << "\"" << chn <<"\":{";

  sprintf(reg, "%s.WIDTH", base);
  os << "\"width\":" << quad->Read(std::string(reg)) * 10 << ",";
  for (int i = 0; i < 4; ++i) {
    sprintf(reg, "%s.START.%d", base, i + 1);
    os << "\"delay" << i + 1 << "\":" << quad->Read(std::string(reg)) * 10 << ",";
  }
  os.seekp(-1, std::ios_base::end);
  os << "}";
  return os.str();
}
