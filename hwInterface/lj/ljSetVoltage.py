#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
VoltageLabjackIP = '192.168.30.85'
VoltageLabjackDevType = 7
VoltageLabjackConnType = 3

vScaleFactor = {"fs": 3., "ss": 4., "os": 4.}
cScaleFactor = {"fs": 6.6, "ss": 5.0, "os": 7.5}
psSetVoltagePort = {"fs": "TDAC0", "ss": "TDAC1", "os": "TDAC7"}

from labjack import ljm
import sys

def main():
    if len(sys.argv) not in [3, 4]:
        print("Correct syntax is %s vFS vSS, or %s vFS vSS vOS" % (sys.argv[0],
                                                                   sys.argv[0]))
        exit(-1)

    else:
        ret = int(-1)
        try:
            setpoint = {}
            if len(sys.argv) == 4:
                setpoint["fs"] = float(sys.argv[1])
                setpoint["ss"] = float(sys.argv[2])
                setpoint["os"] = float(sys.argv[3])
            elif len(sys.argv) == 3:
                setpoint["fs"] = float(sys.argv[1])
                setpoint["ss"] = float(sys.argv[2])
                setpoint["os"] = float(sys.argv[2])

            hndl = ljm.open(VoltageLabjackDevType, VoltageLabjackConnType, 
                            VoltageLabjackIP)
            info = ljm.getHandleInfo(hndl)
            if info[0] == 7:
                for ps in ["fs", "ss", "os"]:
                    ljm.eWriteName(hndl, psSetVoltagePort[ps], setpoint[ps] / vScaleFactor[ps])
                ljm.close(hndl)
                ret = 0
        except Exception as e:
            print(e)
            ret = -1
        return ret

if __name__ == "__main__":
    vals = main()
    exit(vals)

