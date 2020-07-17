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
  std::string ipAddress("192.168.30.89");
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

  }

    else if (mode_s == "Single"){ // single pulse on all channels
      pulser->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);
      pulser->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x1);
      pulser->Write("ADCBOARD.1.FP_PULSER.USER_PULSE", 0x1);
      pulser->Write("ADCBOARD.2.FP_PULSER.USER_PULSE", 0x1);
      pulser->Write("ADCBOARD.3.FP_PULSER.USER_PULSE", 0x1);
      pulser->Write("ADCBOARD.4.FP_PULSER.USER_PULSE", 0x1);
      pulser->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x0);
    }
    else if (mode_s == "Burst"){
      pulser->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);

      pulser->Write("TRIGGER.FREE_RUN.BURST_MASK", 0xFF0000FF);
      pulser->Write("TRIGGER.FREE_RUN.BURST_MODE", 0x1);
      pulser->Write("TRIGGER.FREE_RUN.BURST_SPACING", 10000); // 10k ticks = 0.1ms
      pulser->Write("TRIGGER.FREE_RUN.PERIOD", 1400); // msec
      pulser->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x1);
      pulser->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x0);
      std::this_thread::sleep_for(std::chrono::milliseconds(tsleep));
      pulser->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x1);
      pulser->Write("TRIGGER.FREE_RUN.ENABLE", 0x1);
    }
    else if (found != std::string::npos){ // periodic internal modes
      std::stringstream ss(mode);
      unsigned int freq;
      ss >> freq;

      if (freq > maxFreq || freq < 0) {
        std::cerr << "Error: Internal trigger frequency should be positive," <<
          " and not exceeding " << maxFreq << " Hz." << std::endl;
        return -1;
      }

      pulser->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);

      pulser->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x1);
      pulser->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x0);
      pulser->Write("TRIGGER.FREE_RUN.PERIOD", int(1000/freq));
      std::this_thread::sleep_for(std::chrono::milliseconds(tsleep));
      pulser->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x1);
      pulser->Write("TRIGGER.FREE_RUN.ENABLE", 0x1);
    }
    else {
      std::cerr << "Invalid pulse mode" << std::endl;
      showUsage(argv[0]);
      return -1;
    }


  return 0;
}
