#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from random import uniform
from subprocess import Popen, PIPE, DEVNULL
import ast

nQuads = 4
plate = ["i", "o", "t", "b"]
ptype = ["s", "l"]
#  cv = {
  #  "os": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
  #  "fs": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
  #  "ss": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
#  };
readSparkCmd = "/home/daq/ESQ/jscontrol/hwInterface/camacSparkRead.sh"
proc = Popen((readSparkCmd), stdout=PIPE, stderr=PIPE)
out, err = proc.communicate()

if str(err, "utf-8") == "":
    out = str(out, "utf-8").split("\n") # 35 lines including the empty last one
    if len(out) != 35:
        exit(-1)
    
    spark = []
    for line in out[:-1]:
        word = line.split()
        if len(word) != 4:
            exit(-1)

        spark.append(int(word[-1]))

    ostr = '{'

    idx = 1
    ostr += '"q%d":' % idx
    ostr += ' {"l": {"i": %d, "o": %d, "t": %d, "b": %d},' % (spark[0],
                                                              spark[1],
                                                              spark[2],
                                                              spark[3])
    ostr += ' "s": {"i": %d, "o": %d, "t": %d, "b": %d}},' % (spark[4],
                                                              spark[5],
                                                              spark[6],
                                                              spark[7])
    idx = 2
    ostr += '"q%d":' % idx
    ostr += ' {"s": {"i": %d, "o": %d, "t": %d, "b": %d},' % (spark[8],
                                                              spark[9],
                                                              spark[10],
                                                              spark[11])
    ostr += ' "l": {"i": %d, "o": %d, "t": %d, "b": %d}},' % (spark[12],
                                                              spark[13],
                                                              spark[14],
                                                              spark[15])
    idx = 3
    ostr += '"q%d":' % idx
    ostr += ' {"l": {"i": %d, "o": %d, "t": %d, "b": %d},' % (spark[16],
                                                              spark[17],
                                                              spark[18],
                                                              spark[19])
    ostr += ' "s": {"i": %d, "o": %d, "t": %d, "b": %d}},' % (spark[20],
                                                              spark[21],
                                                              spark[22],
                                                              spark[23])
    idx = 4
    ostr += '"q%d":' % idx
    ostr += ' {"s": {"i": %d, "o": %d, "t": %d, "b": %d},' % (spark[24],
                                                              spark[25],
                                                              spark[26],
                                                              spark[27])
    ostr += ' "l": {"i": %d, "o": %d, "t": %d, "b": %d}},' % (spark[28],
                                                              spark[29],
                                                              spark[30],
                                                              spark[31])
    
    ostr = ostr[:-1]
    ostr += "}"
    print(ostr)

    exit(0)
else:
    exit(-1)


