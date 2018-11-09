#!/usr/bin/env python3
# -*- coding: utf-8 -*-
VoltageLabjackIP = '192.168.30.85'
VoltageLabjackDevType = 7
VoltageLabjackConnType = 3

# ports
psVCReadoutPort = {"fs": ["AIN0", "AIN1", "AIN6", "AIN7"], 
                   #FS:     NC      NV      PC      PV
                   "ss": ["AIN2", "AIN3", "AIN4", "AIN5"],
                   #SS:     NC      NV      PC      PV
                   "os": ["AIN8", "AIN9", "AIN10", "AIN11"],
                   #OS:     NC      NV      PC      PV
                   "Spark": ["AIN12"]}
vScaleFactor = {"fs": 3., "ss": 4., "os": 4.}
cScaleFactor = {"fs": 6.6, "ss": 5.0, "os": 7.5}

from labjack import ljm
def main(devAddress, ports,
         devType=ljm.constants.dtT7, connType=ljm.constants.ctETHERNET):

    ret = None
    try:
        hndl = ljm.open(devType, connType, devAddress)
        info = ljm.getHandleInfo(hndl)
        if info[0] == 7:
            if ports is not None:
                ret = ljm.eReadNames(hndl, len(ports), ports)
            ljm.close(hndl)
    except Exception as e:
        print(e)

    return ret

if __name__ == "__main__":
    ports = psVCReadoutPort["fs"] + psVCReadoutPort["ss"] + psVCReadoutPort["os"] + psVCReadoutPort["Spark"]

    vals = main(VoltageLabjackIP, ports, VoltageLabjackDevType, VoltageLabjackConnType)

    meas = ["nc", "nv", "pc", "pv"]
    ps = ["fs", "ss", "os"]

    if len(vals) == 13:
        vals[0] *= cScaleFactor["fs"]
        vals[1] *= vScaleFactor["fs"]
        vals[2] *= cScaleFactor["fs"]
        vals[3] *= vScaleFactor["fs"]

        vals[4] *= cScaleFactor["ss"]
        vals[5] *= vScaleFactor["ss"]
        vals[6] *= cScaleFactor["ss"]
        vals[7] *= vScaleFactor["ss"]

        vals[8] *= cScaleFactor["os"]
        vals[9] *= vScaleFactor["os"]
        vals[10] *= cScaleFactor["os"]
        vals[11] *= vScaleFactor["os"]

        #  out = '{'
        #  out += '"fs":' + vals[:4].__str__() + ", "
        #  out += '"ss":' + vals[4:8].__str__() + ", "
        #  out += '"os":' + vals[8:12].__str__() + ", "
        #  out += '"spark":' + vals[-1].__str__()
        #  out += '}'
        #  print(out)

        out = '{'
        for idx in range(len(ps)):
            out += '"%s" : {"nc": %.3f, "nv": %.3f, "pc": %.3f, "pv": %.3f},' % (
                ps[idx], vals[idx*4], vals[4*idx + 1], vals[4*idx + 2], vals[4*idx + 3])
        out += ' "spark": %.3f}' % vals[12]
        print(out)
        exit(0)
    else:
        print("ERROR")
        exit(-1)
