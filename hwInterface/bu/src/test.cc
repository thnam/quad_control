// Adapt from BUTool.cxx
#include <string>
#include <vector>
#include <map>
#include <iostream>
#include <sstream>
#include <stdlib.h>
#include <cstdlib>
#include <bitset>
#include <fstream>
#include <iostream>
#include <string>

#include <future>         // std::async, std::future
#include <chrono>         // std::chrono::milliseconds
#include <thread>

#include "BoardMap.h"

int main() {
  BoardMap boardMap = readBoardMap();

  for (auto& t : boardMap) {
    std::cout << t.first << ": ";
    for (auto& k : t.second)
      std::cout << k << " ";
    std::cout << std::endl;
  }

  return 0;
}
