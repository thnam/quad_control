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
  unsigned int tsleep = atoi(argv[1]);
  unsigned int ncycles = atoi(argv[2]);
  try {
    std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
    std::string ipAddress("192.168.30.89");

    g2quad * quad = new g2quad(addressTable, ipAddress);
    
    std::ostringstream output;

    for (unsigned int i = 0; i < ncycles; ++i) {
      unsigned int status = quad->Read("ADCBOARD.1.DB9.STATUS");
      output << ((status & 0x4) >> 2);
      std::this_thread::sleep_for(std::chrono::microseconds(tsleep));
    }
    // std::cout <<  std::hex << quad->Read(0x05) << std::endl;
    std::cout << output.str() << std::endl;

  }catch(const std::exception& e) {
    std::cout << e.what() << std::endl;
  }
  return 0;
}
