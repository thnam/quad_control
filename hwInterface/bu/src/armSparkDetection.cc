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
std::vector<std::string> params { "EN_LOW", "EN_HIGH", "LOW_THRESH",
  "HIGH_THRESH"};
std::vector<uint32_t> values { 0x1, 0x1};

int main(int argc, char *argv[]) {
  // check arguments, only accept 2 cases
  if (!(argc==3)) {
    std::cerr << "Invalid arguments. The syntax is:\n"
      << argv[0] << " lower_threshhold upper_threshold"
      << std::endl;

    return -1;
  }
  values.push_back((uint32_t)atoi(argv[1])); // low thresh
  values.push_back((uint32_t)atoi(argv[2])); // high thres

  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string ipAddress("192.168.30.89");
  try {
    quad = new g2quad(addressTable, ipAddress);
  }catch(const std::exception & e) {
    std::cerr << "Could not connect to the Zynq at " << ipAddress << std::endl;
    std::cerr<< e.what() << std::endl;
    return -1;
  }


  for (uint32_t iboard = 1; iboard <= 4; ++iboard) {
    for (uint32_t ichn = 1; ichn <= 8; ++ichn) {
      for (uint32_t iparam = 0; iparam < params.size(); ++iparam) {
        std::stringstream reg;
        reg << "ADCBOARD." << iboard << ".ED.CH" << ichn << "." << params[iparam];
        quad->Write(reg.str(), values.at(iparam));
      }
    }
  }

  for (uint32_t iboard = 1; iboard <= 4; ++iboard) {
        std::stringstream reg;
        reg << "ADCBOARD." << iboard << ".ED.ARM";
        quad->Write(reg.str(), 0x1);
        reg << "ED";
        std::cout << reg.str() << ": " << quad->Read(reg.str()) << std::endl;
  }


}

