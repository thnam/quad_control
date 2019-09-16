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

void showUsage(char * name);
void readRFSettings(unsigned int chn = 1);

int main(int argc, char *argv[])
{
  // check arguments, only accept 2 cases
  if (!(argc==7 || argc==6)) {
    std::cerr << "Invalid arguments" << std::endl;
    showUsage(argv[0]);
    return -1;
  }

  // open a connection
  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string ipAddress("192.168.30.89");
  try {
    quad = new g2quad(addressTable, ipAddress);
  }catch(const std::exception & e) {
    std::cerr << "Could not connect to the Zynq at " << ipAddress << std::endl;
    std::cerr<< e.what() << std::endl;
    return -1;
  }

  char base[256];
  char reg[256];
  sprintf(base, "ADCBOARD.%s.FP_RF_PULSER", argv[1]);
  for (int i = 1; i < 5; ++i) {
    sprintf(reg, "%s.START.%d", base, i);
    quad->Write(std::string(reg), atoi(argv[i + 1]));
  }

  sprintf(reg, "%s.WIDTH", base);
  if (argc == 7) 
    quad->Write(std::string(reg), atoi(argv[6]));
  else
    quad->Write(std::string(reg), 3000);

  return 0;
}

void readRFSettings(unsigned int chn){
  char base[120];
  char reg[256];
  sprintf(base, "ADCBOARD.%d.FP_RF_PULSER", chn);

  std::cout << "RF pulser 1: " << std::endl;
  sprintf(reg, "%s.WIDTH", base);
  std::cout << reg << ": " << quad->Read(std::string(reg)) * 10 << std::endl;
  for (int i = 0; i < 4; ++i) {
    sprintf(reg, "%s.START.%d", base, i + 1);
    std::cout << reg << ": " << quad->Read(std::string(reg)) * 10 << std::endl;
  }
}

void showUsage(char * name){
  std::cout << "Usage: "<< std::string(name) << " channel RFdelay1 RFdelay2"
    << " RFdelay3 RFdelay4 [pulseWidth] (all in ns)"
    << std::endl;
}
