// Adapt from BUTool.cxx
#include <string>
#include <vector>
#include <iostream>
#include <sstream>
#include <stdlib.h>
#include <cstdlib>
#include <bitset>

#include <future>         // std::async, std::future
#include <chrono>         // std::chrono::milliseconds
#include <thread>

#include "g2quad/g2quad.hh"

int main(int argc, char *argv[])
{
  try {
    std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
    std::string ipAddress("192.168.30.89");

    g2quad * pulser = new g2quad(addressTable, ipAddress);
    pulser->Write("TRIGGER.STATUS.ENABLE_PULSERS", 0x0);
    std::cout << "Success" << std::endl;

  }catch(const std::exception& e) {
    std::cerr << e.what() << std::endl;
    return -1;
  }
  return 0;
}
