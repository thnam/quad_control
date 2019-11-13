#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ports
psResetPort = {"NTS": "FIO1",
               "POS": "FIO5",
               "PTS": "FIO3",
               "NOS": "FIO7"}

from labjack import ljm
import time
import sys

ResetLabjackIP = "192.168.30.83"

def main(devAddress, port, vals,
         devType=ljm.constants.dtANY, connType=2):

    ret = None
    try:
        hndl = ljm.open(devType, connType, devAddress)
        info = ljm.getHandleInfo(hndl)
        if info[0] == 7:
            if port is not None:
                  for val in vals:
                      ret = ljm.eWriteName(hndl, port, val)
                      time.sleep(0.1)
            ljm.close(hndl)
            ret = 0
    except Exception as e:
        print(e)

    return ret

if __name__ == "__main__":
    if (len(sys.argv) is not 2) or (sys.argv[1] not in psResetPort.keys()):
        print("Bad command, the syntax is: %s pulser_name(NOS/POS/PTS/NTS)" % sys.argv[0])
        exit(-1)
    else:
        print("Resetting", sys.argv[1])
        main(ResetLabjackIP, psResetPort[sys.argv[1]], [0., 1., 0.])
