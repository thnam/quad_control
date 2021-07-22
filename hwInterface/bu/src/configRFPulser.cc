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
std::string readRFSettings(unsigned int chn = 1);

std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
std::string topZynqIpAddress("192.168.30.12");
std::string botZynqIpAddress("192.168.30.11");

int main(int argc, char *argv[])
{
  // check arguments, only accept 2 cases
  if (!(argc==7 || argc==6 || argc==1)) {
    std::cerr << "Invalid arguments" << std::endl;
    showUsage(argv[0]);
    return -1;
  }

  bm = readBoardMap();

  // if there is no argument, just printout the settings
  if (argc == 1) {
    std::cout << "{\"RF\":{";
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

  char base[256];
  char reg[256];
  sprintf(base, "ADCBOARD.%s.FP_RF_PULSER", argv[1]);

  try {
    if (std::find(bm["top"].begin(), bm["top"].end(), atoi(argv[1])) != bm["top"].end()) 
      quad = new g2quad(addressTable, topZynqIpAddress);
    else if (std::find(bm["bot"].begin(), bm["bot"].end(), atoi(argv[1])) != bm["bot"].end()) 
      quad = new g2quad(addressTable, botZynqIpAddress);
  }catch(const std::exception & e) {
    std::cerr << "Could not connect to the Zynq at " << topZynqIpAddress <<
      " or at " << botZynqIpAddress << std::endl;
    std::cerr<< e.what() << std::endl;
    return -1;
  }

  for (int i = 1; i < 5; ++i) {
    sprintf(reg, "%s.START.%d", base, i);
    quad->Write(std::string(reg), atoi(argv[i + 1]) / 10);
  }

  sprintf(reg, "%s.WIDTH", base);
  if (argc == 7) 
    quad->Write(std::string(reg), atoi(argv[6]) / 10);
  else
    quad->Write(std::string(reg), 3000);

  return 0;
}

std::string readRFSettings(unsigned int chn){
  char base[120];
  char reg[256];
  sprintf(base, "ADCBOARD.%d.FP_RF_PULSER", chn);

  if (std::find(bm["top"].begin(), bm["top"].end(), chn) != bm["top"].end()) 
    quad = new g2quad(addressTable, topZynqIpAddress);
  else if (std::find(bm["bot"].begin(), bm["bot"].end(), chn) != bm["bot"].end()) 
    quad = new g2quad(addressTable, botZynqIpAddress);

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

void showUsage(char * name){
  std::cout << "Usage: "<< std::string(name) << " channel RFdelay1 RFdelay2"
    << " RFdelay3 RFdelay4 [pulseWidth] (all in ns)"
    << std::endl;
}
