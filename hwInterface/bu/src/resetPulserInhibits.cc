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

int main(int argc, char *argv[]) {
  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string topZynqIpAddress("192.168.30.180");
  std::string botZynqIpAddress("192.168.30.181");
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

  for (uint32_t iBoard = 1; iBoard <= 4; ++iBoard) {
    std::stringstream reg;
    // ADCBOARD.1.FP_PULSER.RESET_INHIBIT
    reg << "ADCBOARD." << iBoard << ".FP_PULSER.RESET_INHIBIT";
    if (std::find(boardMap["top"].begin(), boardMap["top"].end(), iBoard) != boardMap["top"].end())
      topQuad->Write(reg.str(), 0x1);
    else if (std::find(boardMap["bot"].begin(), boardMap["bot"].end(), iBoard) != boardMap["bot"].end())
      botQuad->Write(reg.str(), 0x1);

    std::stringstream rf_reg;
    rf_reg << "ADCBOARD." << iBoard << ".FP_RF_PULSER.RESET";
    if (std::find(boardMap["top"].begin(), boardMap["top"].end(), iBoard) != boardMap["top"].end())
      topQuad->Write(rf_reg.str(), 0x1);
    else if (std::find(boardMap["bot"].begin(), boardMap["bot"].end(), iBoard) != boardMap["bot"].end())
      botQuad->Write(rf_reg.str(), 0x1);

  }
}

