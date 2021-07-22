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

BoardMap bm;
g2quad * quad;

void showUsage(char * name);
std::string readSpareIOSettings(unsigned int chn = 1);
std::vector<std::string> spareIORegs = {
  "FP_RF_TRIG_SPARE_EN", 
  "FP_RF_TRIG_SPARE_LENGTH",
  "FP_RF_TRIG_SPARE_START"
};
const uint32_t CLK_PERIOD_NS = 10; // ns

std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
std::string topZynqIpAddress("192.168.30.12");
std::string botZynqIpAddress("192.168.30.11");

int main(int argc, char *argv[])
{
  // check arguments, only accept 2 cases
  if (!(argc==4 || argc==1)) {
    std::cerr << "Invalid arguments" << std::endl;
    showUsage(argv[0]);
    return -1;
  }

  bm = readBoardMap();
  // if there is no argument, just printout the settings
  if (argc == 1) {
    std::cout << "{\"Spare\":{";
    for (int i = 0; i < 4; ++i) {
      std::cout << readSpareIOSettings(i + 1); 
      if (i == 3) 
        std::cout << "}}";
      else
        std::cout << ",";
    }
    std::cout << std::endl;
    return 0;
  }

  // there are 3 arguments: channel length delay
  int chn = atoi(argv[1]);
  int length = atoi(argv[2]);
  int delay = atoi(argv[3]);

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

  if (length < 0) {
    std::cerr << "Invalid length, should be a positive integer" << std::endl;
    return -1;
  }
  if (delay < 0) {
    std::cerr << "Invalid delay, should be a positive integer" << std::endl;
    return -1;
  }
  if (chn > 4 || chn < 1) {
    std::cerr << "Invalid channel number, must be in range [1, 4]" << std::endl;
    return -1;
  }

  char tmpStr[20];
  sprintf(tmpStr, "ADCBOARD.%d", chn);
  std::string prefix(tmpStr);
  std::string reg;

  reg = prefix + "." + spareIORegs[0];
  if (length == 0) {
    quad->Write(reg, 0);
    return 0;
  } else {
    quad->Write(reg, 1);
    reg = prefix + "." + spareIORegs[1];
    quad->Write(reg, length / CLK_PERIOD_NS);
    reg = prefix + "." + spareIORegs[2];
    quad->Write(reg, delay / CLK_PERIOD_NS);
  }

  return 0;
}

std::string readSpareIOSettings(unsigned int chn){
  char tmpStr[20];
  sprintf(tmpStr, "ADCBOARD.%d", chn);
  std::string prefix(tmpStr);

  std::stringstream os;
  os << "\"" << chn <<"\":{";

  if (std::find(bm["top"].begin(), bm["top"].end(), chn) != bm["top"].end()) 
    quad = new g2quad(addressTable, topZynqIpAddress);
  else if (std::find(bm["bot"].begin(), bm["bot"].end(), chn) != bm["bot"].end()) 
    quad = new g2quad(addressTable, botZynqIpAddress);

  std::string reg;
  reg = prefix + "." + "FP_RF_TRIG_SPARE_EN";
  os << "\"en\":" << quad->Read(reg) << ",";
  reg = prefix + "." + "FP_RF_TRIG_SPARE_LENGTH";
  os << "\"length\":" << quad->Read(reg) * CLK_PERIOD_NS << ",";
  reg = prefix + "." + "FP_RF_TRIG_SPARE_START";
  os << "\"start\":" << quad->Read(reg) * CLK_PERIOD_NS << "}";
  return os.str();
}

void showUsage(char * name){
  std::cout << "Usage: "<< std::string(name) << " channel length_in_ns delay_in_ns"
    << std::endl;
}
