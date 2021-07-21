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

// brd 1 <-> Q1, channel: 1-st, 2-sb, 3-si, 4-so, 5-lt, 6-lb, 7-li, 8-lo
// std::vector<std::string> qPlates = {"st", "sb", "si", "so",
  // "lt", "lb", "li", "lo"};
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

  std::stringstream os;
  os << "{";
  for (uint32_t iboard = 1; iboard <= 4; ++iboard) {
    os << "\"q" << iboard << "\":{";
    std::stringstream reg;
    reg << "ADCBOARD." << iboard << ".ED.ARMED";
    uint32_t ret;
    if (std::find(boardMap["top"].begin(), boardMap["top"].end(), iboard) != boardMap["top"].end())
      ret = topQuad->Read(reg.str()) & 0xFF;
    else if (std::find(boardMap["bot"].begin(), boardMap["bot"].end(), iboard) != boardMap["bot"].end())
      ret = botQuad->Read(reg.str()) & 0xFF;

    for (uint32_t k = 0; k < qTypes.size(); ++k) {
      os << "\"" << qTypes.at(k) << "\": {"; 
      for (uint32_t j = 0; j < qPlates.size(); ++j) {
        uint32_t shift = k * qPlates.size() + j;
        // armed status means no spark detected 
        bool sparked = !((ret & (1 << shift)) >> shift);
        os << "\"" << qPlates.at(j) <<"\""<< ":" << sparked;
        if (j != qPlates.size() - 1) 
          os << ",";
        else
          os << "}";
      }
      if (k != qTypes.size() - 1) 
        os << ",";
    }

    if (iboard != 4) 
      os << "},";
    else
      os << "}";
  
  }
  os << "}";

  std::cout << os.str() << std::endl;
}

