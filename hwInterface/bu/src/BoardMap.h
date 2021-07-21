#ifndef BOARDMAP_H_DSLYH5VR
#define BOARDMAP_H_DSLYH5VR

#include <string>
#include <vector>
#include <map>
typedef std::map<std::string, std::vector<int>> BoardMap;
BoardMap readBoardMap(std::string filename="/home/daq/ESQ/jscontrol/hwInterface/bu/buConfig.txt");


#endif /* end of include guard: BOARDMAP_H_DSLYH5VR */
