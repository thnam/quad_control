#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
from random import gauss
from time import sleep
import json
from pprint import pprint
import sys

#  cv = {
  #  "os": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
  #  "fs": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
  #  "ss": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
#  };

spFile = "./hwInterface/setpoint.json"
with open(spFile) as f:
    setpoint = json.load(f)

# get setpoint from arguments if exist
if len(sys.argv) > 1:
    if len(sys.argv) == 4:
        setpoint["v"]["fs"] = float(sys.argv[1])
        setpoint["v"]["ss"] = float(sys.argv[2])
        setpoint["v"]["os"] = float(sys.argv[3])
    elif len(sys.argv) == 3:
        setpoint["v"]["fs"] = float(sys.argv[1])
        setpoint["v"]["ss"] = float(sys.argv[2])
        setpoint["v"]["os"] = float(sys.argv[2])
    if len(sys.argv) == 5:
        setpoint["v"]["fs"] = float(sys.argv[1])
        setpoint["v"]["ss"] = float(sys.argv[2])
        setpoint["v"]["os"] = float(sys.argv[3])
        setpoint["spark"]["value"] = float(sys.argv[4])
        print(setpoint)
    else:
        exit(-1)

    sleep(2)
    with open(spFile, 'w') as outfile:
        json.dump(setpoint, outfile)


pulsers = ["os", "fs", "ss"]
ostr = '{'
for ps in pulsers:
  ostr += '"%s" : {"pv": %.3f, "nv": %.3f, "pc": %.3f, "nc": %.3f},' % (
      ps,
      gauss(setpoint["v"][ps], setpoint["v"]["sigma"]),
      gauss(-1 * setpoint["v"][ps], setpoint["v"]["sigma"]),
      gauss(setpoint["c"][ps], setpoint["v"]["sigma"]),
      gauss(-1 * setpoint["c"][ps], setpoint["v"]["sigma"]))

#  ostr += ' "spark": %s}' % float('%.3g' % gauss(-.4, .2))
ostr += ' "spark": %s}' % float('%.3g' % gauss(setpoint["spark"]["value"],
                                               setpoint["spark"]["sigma"]))

print(ostr)
