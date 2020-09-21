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
  if (argc < 2) {
    std::cerr << "No argument provided." << std::endl;
    showUsage(argv[0]);
    return -1;
  }

  int tsleep = 200; // ms
  const char *ipAddress = NULL;
  unsigned int board = 0;
  int opt;
  while ((opt = getopt(argc, argv, "m:h:p:")) != -1) {
    switch (opt) {
      case 'h':
        ipAddress = optarg;
        break;
      case 'p':
        board = atoi(optarg);
        break;
      default: /* '?' */
        showUsage(argv[0]);
        return 0;
    }
  }

  if (board > 4 || board < 1) {
    std::cerr << "Invalid board, must be one of (1, 2, 3, 4)" << std::endl;
    return -2;
  }

  if (!ipAddress) 
    ipAddress = "192.168.30.89";

  try {
    std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));

    g2quad * dev = new g2quad(addressTable, std::string(ipAddress));
    std::stringstream reg;
    reg << "ADCBOARD." << board << ".FP_PULSER.DISABLE";
    dev->Write(reg.str(), 0x1);

    std::this_thread::sleep_for(std::chrono::milliseconds(tsleep));
    reg.str("");
    reg << "ADCBOARD." << board << ".FP_PULSER.ENABLED";
    if (dev->Read(reg.str()) != 0x0) {
      std::cerr << "Could not disable pulser " << board << std::endl;
      return -1;
    }
  }catch(const std::exception& e) {
    std::cerr << e.what() << std::endl;
    return -1;
  }
  return 0;
}

void showUsage(char * name){
  std::cout << "Usage: " << std::string(name) << " -p \"pulser_board\""
    << " [-h \"zynq_ip_address\"]" << std::endl;
  std::cout << "  - pulser_board must be in (1, 2, 3, 4)" << std::endl;
  std::cout << "  - default IP of 192.168.30.89 is used if not provided" << std::endl;
}

