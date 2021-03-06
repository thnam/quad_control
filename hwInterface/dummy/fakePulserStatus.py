#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from random import uniform

#  status = {
  #  "nos": {"enable": 1., "fault": 1., "interlock": 0.1},
  #  "pos": {"enable": 1., "fault": 1., "interlock": 0.1},
  #  "nts": {"enable": 1., "fault": 1., "interlock": 0.1},
  #  "pts": {"enable": 1., "fault": 1., "interlock": 0.1},
#  };
pulsers = ["pos", "nos", "pts", "nts"]
ostr = '{'
for ps in pulsers:
  ostr += '"%s" : {"enable": %.1f, "fault": %.1f, "interlock": %.1f},' % (
      ps,
      int(uniform(4, 5)/3.5),
      int(uniform(0, 0.2)/3.5),
      int(uniform(4, 5)/3.5))

ostr = ostr[:-1]
ostr += '}'

print(ostr)
