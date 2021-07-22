// Adapt from BUTool.cxx
#include <string>
#include <locale>         // std::locale, std::toupper
#include <vector>
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

int main(int argc, char *argv[])
{
  // open a connection
  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string ipAddress("192.168.30.11");
  try {
    quad = new g2quad(addressTable, ipAddress);
  }catch(const std::exception & e) {
    std::cerr << "Could not connect to the Zynq at " << ipAddress << std::endl;
    std::cerr<< e.what() << std::endl;
    return -1;
  }

  uint32_t running;
  uint32_t extTrig;
  uint32_t intTrig;

  running = quad->Read("TRIGGER.FREE_RUN.ENABLE");
  if (running == 0) {
    std::cout << "Stop" << std::endl;
    return 0;
  }
  else if (running > 1){
    std::cerr << "Strange value of TRIGGER.FREE_RUN. ENABLE ..." << std::endl;
    return -1;
  }

  // ok, it is running, figuring out the mode
  extTrig = quad->Read("TRIGGER.FREE_RUN.EN_EXT_TRIG");
  intTrig = quad->Read("TRIGGER.FREE_RUN.EN_FR_TRIG");

  if (extTrig == 1 && intTrig == 1) {
    std::cerr << "Wrong config, both internal and external triggers are enabled!"<< std::endl;
    return -1;
  }
  else if (extTrig == 0 && intTrig == 0){
    std::cout << "Stop" << std::endl;
    return 0;
  }
  else if (extTrig == 1 && intTrig == 0){
    std::cout << "External" << std::endl;
    return 0;
  }
  else if (extTrig == 0 && intTrig == 1){
    int freq = 1000 / quad->Read("TRIGGER.FREE_RUN.PERIOD");
    std::cout << freq << " Hz" << std::endl;
    return 0;
  }

  return 0;
}
