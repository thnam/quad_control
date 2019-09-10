// Adapt from BUTool.cxx
#include <string>
#include <vector>
#include <iostream>
#include <sstream>
#include <stdlib.h>
#include <cstdlib>
#include <bitset>

#include <future>         // std::async, std::future
#include <chrono>         // std::chrono::milliseconds
#include <thread>

#include "g2quad/g2quad.hh"

g2quad * quad;
void readPulserSettings(unsigned int chn = 1);

int main(int argc, char *argv[])
{
  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string ipAddress("192.168.30.89");

  quad = new g2quad(addressTable, ipAddress);

  for (int i = 0; i < 4; ++i) {
    readPulserSettings(1 + i);
  }

  return 0;
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
