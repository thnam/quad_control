#!/usr/bin/env python3
# -*- coding: utf-8 -*-
FaultLabjackIP = '192.168.30.83'
FaultLabjackDevType = 7
FaultLabjackConnType = 2

# ports
psStatusReadoutPort = {"NOS": ["AIN09", "AIN08", "FIO6"], #fault, interlock, enable
                       "POS": ["AIN07", "AIN06", "FIO4"],
                       "PTS": ["AIN05", "AIN04", "FIO2"],
                       "NTS": ["AIN03", "AIN02", "FIO0"]}

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
    ports = psStatusReadoutPort["NOS"] + psStatusReadoutPort["POS"] + psStatusReadoutPort["PTS"] + psStatusReadoutPort["NTS"]

    vals = main(FaultLabjackIP, ports, FaultLabjackDevType, FaultLabjackConnType)

    ps = ["nos", "pos", "pts", "nts"]

    if len(vals) == 12:
        out = '{'
        for idx in range(len(ps)):
            out += '"%s" : {"fault": %.1f, "interlock": %.1f, "enabled": %.1f},' % (
                ps[idx],
                int(vals[idx*3] / 3.5), # fault
                int(vals[3*idx + 1] / 3.5), # interlock, convert to logic level
                vals[3*idx + 2]) # enabled, already in logic level
        out = out[:-1]
        out += '}'

        print(out)
        exit(0)

    else:
        print("ERROR")
        exit(-1)
