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

const uint32_t CLK_PERIOD_NS = 10; // ns
void readPulserSettings(g2quad * quad = topQuad, unsigned int chn = 1);
std::string PulserSettingsJson(g2quad * quad = topQuad, unsigned int chn = 1);
std::string readRFSettings(g2quad * quad = topQuad, unsigned int chn = 1);
std::string readSpareIOSettings(g2quad * quad = topQuad, unsigned int chn = 1);

int main(int argc, char *argv[])
{
  std::string addressTable(std::getenv("G2QUAD_ADDRESS_TABLE"));
  std::string topZynqIpAddress("192.168.30.12");
  std::string botZynqIpAddress("192.168.30.11");
  BoardMap boardMap = readBoardMap();

  topQuad = new g2quad(addressTable, topZynqIpAddress);
  botQuad = new g2quad(addressTable, botZynqIpAddress);

  std::cout << "{\"Pulser\":{";
  for (int i = 0; i < 4; ++i) {
    if (std::find(boardMap["top"].begin(), boardMap["top"].end(), i+1) != boardMap["top"].end())
      std::cout << PulserSettingsJson(topQuad, 1 + i);
    if (std::find(boardMap["bot"].begin(), boardMap["bot"].end(), i+1) != boardMap["bot"].end())
      std::cout << PulserSettingsJson(botQuad, 1 + i);

    if (i == 3) 
      std::cout << "},";
    else
      std::cout << ",";
  }

  std::cout << "\"RF\":{";
  for (int i = 0; i < 4; ++i) {
    if (std::find(boardMap["top"].begin(), boardMap["top"].end(), i+1) != boardMap["top"].end())
      std::cout << readRFSettings(topQuad, i + 1); 
    if (std::find(boardMap["bot"].begin(), boardMap["bot"].end(), i+1) != boardMap["bot"].end())
      std::cout << readRFSettings(botQuad, i + 1); 

    if (i == 3) 
      std::cout << "},";
    else
      std::cout << ",";
  }

  std::cout << "\"Spare\":{";
  for (int i = 0; i < 4; ++i) {
    if (std::find(boardMap["top"].begin(), boardMap["top"].end(), i+1) != boardMap["top"].end())
      std::cout << readSpareIOSettings(topQuad, i + 1); 
    if (std::find(boardMap["bot"].begin(), boardMap["bot"].end(), i+1) != boardMap["bot"].end())
      std::cout << readSpareIOSettings(botQuad, i + 1); 
    if (i == 3) 
      std::cout << "}}";
    else
      std::cout << ",";
  }
  std::cout << std::endl;

  return 0;
}

std::string readSpareIOSettings(g2quad * quad, unsigned int chn){
  char tmpStr[20];
  sprintf(tmpStr, "ADCBOARD.%d", chn);
  std::string prefix(tmpStr);

  std::stringstream os;
  os << "\"" << chn <<"\":{";

  std::string reg;
  reg = prefix + "." + "FP_RF_TRIG_SPARE_EN";
  os << "\"en\":" << quad->Read(reg) << ",";
  reg = prefix + "." + "FP_RF_TRIG_SPARE_LENGTH";
  os << "\"length\":" << quad->Read(reg) * CLK_PERIOD_NS << ",";
  reg = prefix + "." + "FP_RF_TRIG_SPARE_START";
  os << "\"start\":" << quad->Read(reg) * CLK_PERIOD_NS << "}";
  return os.str();
}

std::string PulserSettingsJson(g2quad * quad, unsigned int chn){
  char tmpStr[120];
  sprintf(tmpStr, "ADCBOARD.%d.FP_PULSER.", chn);
  std::string prefix0(tmpStr);
  std::vector<std::string> prefix1 = {"ACTIVE", "PROPOSED"};

  std::vector<std::string> params {"CHARGE_END", "CHARGE_START",
    "DISCHARGE_START", "DISCHARGE_END", "ENABLE_2STEP", "STEP1_END",
    "STEP2_START"};
  std::map<std::string, std::map<std::string, uint32_t> > setting;

  for (auto param : params){
    std::string key = prefix0 + prefix1.at(0) + "." + param;
    unsigned int ret0 = CLK_PERIOD_NS * (quad->Read(key));

    key = prefix0 + prefix1.at(1) + "." + param;
    unsigned int ret1 = CLK_PERIOD_NS * (quad->Read(key));
    if (param != "ENABLE_2STEP"){
      setting[prefix1.at(0)][param] = ret0;
      setting[prefix1.at(1)][param] = ret1;
    } 
    else{
      setting[prefix1.at(0)][param] = ret0/CLK_PERIOD_NS;
      setting[prefix1.at(1)][param] = ret1/CLK_PERIOD_NS;
    }
  }

  std::stringstream os;
  os << "\"" << chn <<"\":{";
  for (auto i : setting) {
    os << "\"" << i.first <<"\":{";
    for (auto j : i.second){
      os << "\"" << j.first <<"\":" << j.second << ",";
    }
    os.seekp(-1, std::ios_base::end);
    os << "},";
  }

  os.seekp(-1, std::ios_base::end);
  os << "}";
  return os.str();
}

void readPulserSettings(g2quad * quad, unsigned int chn){
  char tmpStr[120];
  sprintf(tmpStr, "ADCBOARD.%d.FP_PULSER.", chn);
  std::string prefix0(tmpStr);
  std::vector<std::string> prefix1 = {"ACTIVE.", "PROPOSED."};

  std::string subPrefix = "ACTIVE.";

  std::cout << "-------------------------------------------------" << std::endl;
  std::vector<std::string> params {"CHARGE_END", "CHARGE_START",
    "DISCHARGE_START", "DISCHARGE_END", "ENABLE_2STEP", "STEP1_END",
    "STEP2_START"};

  std::cout << "Pulser " << chn << "\t |\t" << prefix1.at(0)  << " (ns)"
    << "\t|\t" << prefix1.at(1)  << " (ns)"<< std::endl;
  for (std::string param : params){
    unsigned int ret0 = CLK_PERIOD_NS * (quad->Read(prefix0 + prefix1.at(0) + param));
    unsigned int ret1 = CLK_PERIOD_NS * (quad->Read(prefix0 + prefix1.at(1) + param));
    std::cout << param << "\t |\t" << ret0 << "\t\t|\t" << ret1  
      << std::endl;
  }
  std::cout << "-------------------------------------------------" << std::endl;

}

std::string readRFSettings(g2quad * quad, unsigned int chn){
  char base[120];
  char reg[256];
  sprintf(base, "ADCBOARD.%d.FP_RF_PULSER", chn);

  std::stringstream os;
  os << "\"" << chn <<"\":{";

  sprintf(reg, "%s.WIDTH", base);
  os << "\"width\":" << quad->Read(std::string(reg)) * CLK_PERIOD_NS << ",";
  for (int i = 0; i < 4; ++i) {
    sprintf(reg, "%s.START.%d", base, i + 1);
    os << "\"delay" << i + 1 << "\":" << quad->Read(std::string(reg)) * CLK_PERIOD_NS << ",";
  }
  os.seekp(-1, std::ios_base::end);
  os << "}";
  return os.str();
}
