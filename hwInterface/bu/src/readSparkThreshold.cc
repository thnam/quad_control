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

g2quad * topQuad;
g2quad * botQuad;
std::vector<std::string> params { "EN_LOW", "EN_HIGH", "LOW_THRESH",
  "HIGH_THRESH"};
std::vector<uint32_t> values { 0x1, 0x1};
std::vector<std::string> qTypes = {"s", "l"};
std::vector<std::string> qPlates = {"t", "b", "i", "o"};

int main(int argc, char *argv[]) {
  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string topZynqIpAddress("192.168.30.12");
  std::string botZynqIpAddress("192.168.30.11");
  BoardMap boardMap = readBoardMap();

  try {
    topQuad = new g2quad(addressTable, topZynqIpAddress);
    botQuad = new g2quad(addressTable, botZynqIpAddress);
  }catch(const std::exception & e) {
    std::cerr << "Could not connect to the Zynq at " << topZynqIpAddress <<
      " or at " << botZynqIpAddress << std::endl;
    std::cerr<< e.what() << std::endl;
    return -1;
  }


  // for (uint32_t iboard = 1; iboard <= 4; ++iboard) {
    // for (uint32_t ichn = 1; ichn <= 8; ++ichn) {
      // for (uint32_t iparam = 0; iparam < params.size(); ++iparam) {
        // std::stringstream reg;
        // reg << "ADCBOARD." << iboard << ".ED.CH" << ichn << "." << params[iparam];
        // uint32_t ret = quad->Read(reg.str());
        // std::cout << reg.str() << ": " << ret << std::endl;
      // }
    // }
  // }
  // Readout only 1 channel, assuming all channels have the same settings
  // ADCBOARD.4.ED.CH8.LOW_THRESH: 1840
    // ADCBOARD.4.ED.CH8.HIGH_THRESH: 2240
  std::string regLo("ADCBOARD.1.ED.CH1.LOW_THRESH");
  std::string regHi("ADCBOARD.1.ED.CH1.HIGH_THRESH");
  std::cout << "{\"low\":" <<  topQuad->Read(regLo) <<
    "," << "\"high\":" << topQuad->Read(regHi) << "}"
    << std::endl;

}

