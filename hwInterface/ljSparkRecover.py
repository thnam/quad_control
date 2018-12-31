#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from labjack import ljm

VoltageLabjackIP = '192.168.30.85'
VoltageLabjackDevType = 7
VoltageLabjackConnType = 3
resetPort = "TDAC4"
try:
    hndl = ljm.open(VoltageLabjackDevType, VoltageLabjackConnType, 
                    VoltageLabjackIP)
    info = ljm.getHandleInfo(hndl)
    if info[0] == 7:
        ljm.eWriteName(hndl, resetPort, -0.8)
        ljm.close(hndl)
        exit(0)
    else:
        exit(-1)
except Exception as e:
    exit(-1)
