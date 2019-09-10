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

static void show_usage(std::string);
int main(int argc, char *argv[])
{
  unsigned int tsleep = atoi(argv[1]);
  unsigned int ncycles = atoi(argv[2]);
  try {
    std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
    std::string ipAddress("192.168.30.89");

    g2quad * quad = new g2quad(addressTable, ipAddress);
    for (int i = 0; i < ncycles; ++i) {
      std::bitset<8> bits(quad->Read("ADCBOARD.1.DB9.STATUS"));
      std::cout << std::hex << bits << std::endl;
      // unsigned int status = quad->Read("ADCBOARD.1.DB9.STATUS");
      // std::cout << ((status & 0x4) >> 2) << std::endl;
      std::this_thread::sleep_for(std::chrono::milliseconds(tsleep));
    }
    // std::cout <<  std::hex << quad->Read(0x05) << std::endl;

  }catch(const std::exception& e) {
    std::cout << e.what() << std::endl;
  }
  return 0;
}

static void show_usage(std::string name)
{
  std::cerr << "Usage: " << name << " <option(s)> SOURCES"
    << "Options:\n"
    << "\t-h,--help\t\tShow this help message\n"
    << "\t-d,--destination DESTINATION\tSpecify the destination path"
    << std::endl;
}

