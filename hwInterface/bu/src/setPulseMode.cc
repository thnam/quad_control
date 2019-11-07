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

void showUsage(char * name);

int main(int argc, char *argv[])
{
  int opt;
  int tsleep = 750; // ms
  unsigned int maxFreq = 12;
  const char *mode = NULL;
  const char *ipAddress = NULL;

  if (argc < 2) {
    std::cerr << "A pulse mode is required." << std::endl;
    showUsage(argv[0]);
    return -1;
  }

  while ((opt = getopt(argc, argv, "m:h:")) != -1) {
    switch (opt) {
      case 'm':
        mode = optarg;
        break;
      case 'h':
        ipAddress = optarg;
        break;
      default: /* '?' */
        showUsage(argv[0]);
        return 0;
    }
  }

  if (!mode) {
    std::cerr << "A pulse mode is required." << std::endl;
    showUsage(argv[0]);
    return -1;
  }

  if (!ipAddress) 
    ipAddress = "192.168.30.89";

  try {
    std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
    std::string mode_s(mode);

    g2quad * pulser = new g2quad(addressTable, std::string(ipAddress));

    std::size_t found = mode_s.find("Hz");

    // General rule: stop pulsing first, sleep for some time before switch
    // back to pulsing
    if (mode_s == "Stop") { // easy one
      pulser->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);
      pulser->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x0);
      pulser->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x0);
    }
    else if (mode_s == "External"){ // disable fr_trig, enable ext_trig
      for (uint32_t iBoard = 1; iBoard <= 4; ++iBoard) {
        std::stringstream reg;
        // ADCBOARD.1.FP_PULSER.RESET_INHIBIT
        reg << "ADCBOARD." << iBoard << ".FP_PULSER.RESET_INHIBIT";
        pulser->Write(reg.str(), 0x1);
      }
      pulser->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);
      pulser->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x0);
      pulser->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x1);
      std::this_thread::sleep_for(std::chrono::milliseconds(tsleep));
      pulser->Write("TRIGGER.FREE_RUN.ENABLE", 0x1);
    }
    else if (mode_s == "Single"){ // single pulse on all channels
      for (uint32_t iBoard = 1; iBoard <= 4; ++iBoard) {
        std::stringstream reg;
        // ADCBOARD.1.FP_PULSER.RESET_INHIBIT
        reg << "ADCBOARD." << iBoard << ".FP_PULSER.RESET_INHIBIT";
        pulser->Write(reg.str(), 0x1);
      }
      pulser->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);
      pulser->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x1);
      pulser->Write("ADCBOARD.1.FP_PULSER.USER_PULSE", 0x1);
      pulser->Write("ADCBOARD.2.FP_PULSER.USER_PULSE", 0x1);
      pulser->Write("ADCBOARD.3.FP_PULSER.USER_PULSE", 0x1);
      pulser->Write("ADCBOARD.4.FP_PULSER.USER_PULSE", 0x1);
      pulser->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x0);
    }
    else if (mode_s == "Burst"){
      for (uint32_t iBoard = 1; iBoard <= 4; ++iBoard) {
        std::stringstream reg;
        // ADCBOARD.1.FP_PULSER.RESET_INHIBIT
        reg << "ADCBOARD." << iBoard << ".FP_PULSER.RESET_INHIBIT";
        pulser->Write(reg.str(), 0x1);
      }
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

      for (uint32_t iBoard = 1; iBoard <= 4; ++iBoard) {
        std::stringstream reg;
        // ADCBOARD.1.FP_PULSER.RESET_INHIBIT
        reg << "ADCBOARD." << iBoard << ".FP_PULSER.RESET_INHIBIT";
        pulser->Write(reg.str(), 0x1);
      }
      pulser->Write("TRIGGER.FREE_RUN.BURST_MODE", 0x0);
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


  }catch(const std::exception& e) {
    std::cerr << e.what() << std::endl;
    return -1;
  }
  return 0;
}

void showUsage(char * name){
  std::cout << "Usage: " << std::string(name) << " -m \"pulse_mode\"" 
    << " [-h \"zynq_ip_address\"]" << std::endl;
  std::cout << "Available modes are: Stop, 1 Hz, 5 Hz, 10 Hz, Burst, and Single" << std::endl;
}
