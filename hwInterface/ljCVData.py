#!/usr/bin/env python3
# -*- coding: utf-8 -*-
VoltageLabjackIP = '192.168.30.85'
VoltageLabjackDevType = 7
VoltageLabjackConnType = 3

# ports
psVCReadoutPort = {"FS": ["AIN0", "AIN1", "AIN6", "AIN7"], 
                   #FS:     NC      NV      PC      PV
                   "SS": ["AIN2", "AIN3", "AIN4", "AIN5"],
                   #SS:     NC      NV      PC      PV
                   "OS": ["AIN8", "AIN9", "AIN10", "AIN11"],
                   #OS:     NC      NV      PC      PV
                   "Spark": ["AIN12"]}
vScaleFactor = {"FS": 3., "SS": 4., "OS": 4.}
cScaleFactor = {"FS": 6.6, "SS": 5.0, "OS": 7.5}

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
    ports = psVCReadoutPort["FS"] + psVCReadoutPort["SS"] + psVCReadoutPort["OS"] + psVCReadoutPort["Spark"]

    vals = main(VoltageLabjackIP, ports, VoltageLabjackDevType, VoltageLabjackConnType)

    meas = ["nc", "nv", "pc", "pv"]
    ps = ["fs", "ss", "os"]

    if len(vals) == 13:
        vals[0] *= cScaleFactor["FS"]
        vals[1] *= vScaleFactor["FS"]
        vals[2] *= cScaleFactor["FS"]
        vals[3] *= vScaleFactor["FS"]

        vals[4] *= cScaleFactor["SS"]
        vals[5] *= vScaleFactor["SS"]
        vals[6] *= cScaleFactor["SS"]
        vals[7] *= vScaleFactor["SS"]

        vals[8] *= cScaleFactor["OS"]
        vals[9] *= vScaleFactor["OS"]
        vals[10] *= cScaleFactor["OS"]
        vals[11] *= vScaleFactor["OS"]

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
