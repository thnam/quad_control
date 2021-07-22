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
#include "BoardMap.h"

g2quad * devTop;
g2quad * devBot;
BoardMap bm;

void showUsage(char * name);
void resetInhibit();
void enableTop(){
  devTop->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x1);
  devTop->Write("TRIGGER.FREE_RUN.ENABLE", 0x1);
}
void enableBot(){
  devBot->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x1);
  devBot->Write("TRIGGER.FREE_RUN.ENABLE", 0x1);
}

int main(int argc, char *argv[])
{
  int opt;
  int tsleep = 750; // ms
  unsigned int maxFreq = 12;
  const char *mode = NULL;
  const char *topZynqIpAddress = NULL;
  const char *botZynqIpAddress = NULL;

  if (argc < 2) {
    std::cerr << "A pulse mode is required." << std::endl;
    showUsage(argv[0]);
    return -1;
  }

  while ((opt = getopt(argc, argv, "m:t:b:")) != -1) {
    switch (opt) {
      case 'm':
        mode = optarg;
        break;
      case 't':
        topZynqIpAddress = optarg;
        break;
      case 'b':
        botZynqIpAddress = optarg;
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

  if (!topZynqIpAddress) 
    topZynqIpAddress = "192.168.30.12";
  if (!botZynqIpAddress) 
    botZynqIpAddress = "192.168.30.11";

  bm = readBoardMap();

  try {
    std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
    std::string mode_s(mode);

    devTop = new g2quad(addressTable, std::string(topZynqIpAddress));
    devBot = new g2quad(addressTable, std::string(botZynqIpAddress));

    std::size_t foundHz = mode_s.find("Hz");

    const uint32_t nominal_charge_width = 780000; // ns
    const double max_freq = 1.3; // Hz
    uint32_t charge_width[4];
    bool long_pulse = false;

    for (uint32_t i = 0; i < 4; ++i) {
      std::stringstream reg0, reg1;
      reg0 << "ADCBOARD." << i + 1 << ".FP_PULSER.ACTIVE.CHARGE_START";
      reg1 << "ADCBOARD." << i + 1 << ".FP_PULSER.ACTIVE.CHARGE_END";

      if (std::find(bm["top"].begin(), bm["top"].end(), i+1) != bm["top"].end()) 
        charge_width[i] = 10 * (devTop->Read(reg1.str()) - devTop->Read(reg0.str()));
      else if (std::find(bm["bot"].begin(), bm["bot"].end(), i+1) != bm["bot"].end()) 
        charge_width[i] = 10 * (devBot->Read(reg1.str()) - devBot->Read(reg0.str()));

      if (charge_width[i] > nominal_charge_width) 
        long_pulse = true;
    }

    // in case of long pulse and periodic mode
    if (long_pulse && foundHz) {
      std::stringstream ss(mode);
      double freq;
      ss >> freq;
      if (freq > max_freq) {
        std::cerr << "The requested frequency (" << mode 
          << ") is higher than what hardware pulser can hanle "
          << "with current timing settings. Either choose a frequency less than "
          << max_freq << " Hz, or change timing settings." 
          << std::endl;
        return -1;
      }
    }
    // General rule: stop pulsing first, sleep for some time before switch
    // back to pulsing
    if (mode_s == "Stop") { // easy one
      devTop->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);
      devTop->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x0);
      devTop->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x0);
      devBot->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);
      devBot->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x0);
      devBot->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x0);
    }
    else if (mode_s == "External" || mode_s == "CCC"){ // disable fr_trig, enable ext_trig
      resetInhibit();
      devTop->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);
      devTop->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x0);
      devTop->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x0);
      devTop->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x1);

      devBot->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);
      devBot->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x0);
      devBot->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x0);
      devBot->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x1);
      std::this_thread::sleep_for(std::chrono::milliseconds(tsleep));
      devTop->Write("TRIGGER.FREE_RUN.ENABLE", 0x1);
      devTop->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x1);
      devBot->Write("TRIGGER.FREE_RUN.ENABLE", 0x1);
      devBot->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x1);
    }
    else if (mode_s == "Single"){ // single pulse on all channels
      resetInhibit();
      devTop->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);
      devTop->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x1);
      devTop->Write("ADCBOARD.1.FP_PULSER.USER_PULSE", 0x1);
      devTop->Write("ADCBOARD.2.FP_PULSER.USER_PULSE", 0x1);
      devTop->Write("ADCBOARD.3.FP_PULSER.USER_PULSE", 0x1);
      devTop->Write("ADCBOARD.4.FP_PULSER.USER_PULSE", 0x1);
      devTop->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x0);

      devBot->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);
      devBot->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x1);
      devBot->Write("ADCBOARD.1.FP_PULSER.USER_PULSE", 0x1);
      devBot->Write("ADCBOARD.2.FP_PULSER.USER_PULSE", 0x1);
      devBot->Write("ADCBOARD.3.FP_PULSER.USER_PULSE", 0x1);
      devBot->Write("ADCBOARD.4.FP_PULSER.USER_PULSE", 0x1);
      devBot->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x0);
    }
    else if (mode_s == "Burst"){
      resetInhibit();
      devTop->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);

      devTop->Write("TRIGGER.FREE_RUN.BURST_MASK", 0xFF0000FF);
      devTop->Write("TRIGGER.FREE_RUN.BURST_MODE", 0x1);
      devTop->Write("TRIGGER.FREE_RUN.BURST_SPACING", 10000); // 10k ticks = 0.1ms
      devTop->Write("TRIGGER.FREE_RUN.PERIOD", 1400); // msec
      devTop->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x1);
      devTop->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x0);

      devBot->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);

      devBot->Write("TRIGGER.FREE_RUN.BURST_MASK", 0xFF0000FF);
      devBot->Write("TRIGGER.FREE_RUN.BURST_MODE", 0x1);
      devBot->Write("TRIGGER.FREE_RUN.BURST_SPACING", 10000); // 10k ticks = 0.1ms
      devBot->Write("TRIGGER.FREE_RUN.PERIOD", 1400); // msec
      devBot->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x1);
      devBot->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x0);

      std::this_thread::sleep_for(std::chrono::milliseconds(tsleep));
      std::thread threadTop(enableTop);
      std::thread threadBot(enableBot);
      threadTop.join();
      threadBot.join(); 
    }
    else if (foundHz != std::string::npos){ // periodic internal modes
      std::stringstream ss(mode);
      // unsigned int freq;
      double freq;
      ss >> freq;

      if (freq > maxFreq || freq < 0) {
        std::cerr << "Error: Internal trigger frequency should be positive," <<
          " and not exceeding " << maxFreq << " Hz." << std::endl;
        return -1;
      }

      resetInhibit();
      devTop->Write("TRIGGER.FREE_RUN.BURST_MODE", 0x0);
      devTop->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);

      devTop->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x1);
      devTop->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x0);
      devTop->Write("TRIGGER.FREE_RUN.PERIOD", int(1000/freq));

      devBot->Write("TRIGGER.FREE_RUN.BURST_MODE", 0x0);
      devBot->Write("TRIGGER.FREE_RUN.ENABLE", 0x0);

      devBot->Write("TRIGGER.FREE_RUN.EN_FR_TRIG", 0x1);
      devBot->Write("TRIGGER.FREE_RUN.EN_EXT_TRIG", 0x0);
      devBot->Write("TRIGGER.FREE_RUN.PERIOD", int(1000/freq));

      std::this_thread::sleep_for(std::chrono::milliseconds(tsleep));
      std::thread threadTop(enableTop);
      std::thread threadBot(enableBot);
      threadTop.join();
      threadBot.join(); 
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
  std::cout << "Available modes are: Stop, 1 Hz, 5 Hz, 10 Hz, Burst, Single, External, and CCC" << std::endl;
}


void resetInhibit(){
  for (uint32_t iBoard = 1; iBoard <= 4; ++iBoard) {
    std::stringstream reg;
    reg << "ADCBOARD." << iBoard << ".FP_PULSER.RESET_INHIBIT";
    if (std::find(bm["top"].begin(), bm["top"].end(), iBoard) != bm["top"].end()) 
      devTop->Write(reg.str(), 0x1);
    else if (std::find(bm["bot"].begin(), bm["bot"].end(), iBoard) != bm["bot"].end()) 
      devBot->Write(reg.str(), 0x1);

    std::stringstream rf_reg;
    rf_reg << "ADCBOARD." << iBoard << ".FP_RF_PULSER.RESET";
    if (std::find(bm["top"].begin(), bm["top"].end(), iBoard) != bm["top"].end()) 
      devTop->Write(rf_reg.str(), 0x1);
    else if (std::find(bm["bot"].begin(), bm["bot"].end(), iBoard) != bm["bot"].end()) 
      devBot->Write(rf_reg.str(), 0x1);
  }
}
