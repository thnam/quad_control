#include <iostream>
#include <sstream>
#include <fstream>
#include <iostream>
#include <string>
#include "BoardMap.h"

BoardMap readBoardMap(std::string filename){
  std::fstream configFile;
  configFile.open(filename, std::ios::in);
  BoardMap boardMap;

  boardMap["top"] = std::vector<int>();
  boardMap["bot"] = std::vector<int>();

  if (configFile.is_open()){
    std::string str;
    while (std::getline(configFile, str)){
      if (str.front() != '#') {
        std::vector<int>   lineData;
        std::stringstream  lineStream(str);
        int value;

        while (lineStream >> value)
          if (value > 0 && value < 5) 
            lineData.push_back(value);

        if (boardMap["top"].size() == 0) 
          boardMap["top"] = lineData;
        else if (boardMap["bot"].size() == 0)
          boardMap["bot"] = lineData;
      }
      // else {
        // std::cout << str << std::endl;
      // }
    }
    configFile.close();
  }

  return boardMap;
}
