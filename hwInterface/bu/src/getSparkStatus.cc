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

// brd 1 <-> Q1, channel: 1-st, 2-sb, 3-si, 4-so, 5-lt, 6-lb, 7-li, 8-lo
std::vector<std::string> qPlates = {"st", "sb", "si", "so",
  "lt", "lb", "li", "lo"};

int main(int argc, char *argv[]) {
  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string ipAddress("192.168.30.89");
  try {
    quad = new g2quad(addressTable, ipAddress);
  }catch(const std::exception & e) {
    std::cerr << "Could not connect to the Zynq at " << ipAddress << std::endl;
    std::cerr<< e.what() << std::endl;
    return -1;
  }



  std::stringstream os;
  os << "{";
  for (uint32_t iboard = 1; iboard <= 4; ++iboard) {
    os << "\"q" << iboard << "\":{";
    std::stringstream reg;
    reg << "ADCBOARD." << iboard << ".ED.ARMED";
    uint32_t ret = quad->Read(reg.str()) & 0xFF;
    for (uint32_t j = 0; j < qPlates.size(); ++j) {
      os << "\"" << qPlates.at(j) <<"\""<< ":" << ((ret & (1 << j)) >> j);
      if (j != qPlates.size() - 1) {
        os << ",";
      }
    }

    if (iboard != 4) 
      os << "},";
    else
      os << "}";
  
  }
  os << "}";

  std::cout << os.str() << std::endl;
}

