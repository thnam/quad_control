#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from subprocess import Popen, PIPE, DEVNULL
import sys

readThresholdCmd = "/home/daq/ESQ/jscontrol/hwInterface/lj/camacSparkThresholdRead.sh"
setThresholdCmd = "/home/daq/ESQ/jscontrol/hwInterface/lj/camacSparkThresholdSet.sh"

if len(sys.argv) == 1: # read threshold if there is no argument
    proc = Popen((readThresholdCmd), stdout=PIPE, stderr=PIPE)
    out, err = proc.communicate()
    
    if str(err, "utf-8") == "":
        out = str(out, "utf-8").split("\n") # 3 lines
        if len(out) != 3:
            exit(-1)
        
        threshold = []
        for line in out[:-1]:
            word = line.split()
            if len(word) != 6:
                exit(-1)
            threshold.append(int(word[-1]))
    
        ostr = '{'
        ostr += '"3": %d,' % threshold[0]
        ostr += '"6": %d}' % threshold[1]
        print(ostr)
    
        exit(0)
    else:
        exit(-1)

elif len(sys.argv) == 2: # set threshold if there is an argument, no validation is done
    proc = Popen((setThresholdCmd, sys.argv[1]), stdout=PIPE, stderr=PIPE)
    out, err = proc.communicate()
    if (str(err, "utf-8") == "") and (str(out, "utf-8") == ""):
        exit(0)
    else:
        exit(-1)
