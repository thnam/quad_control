#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
from random import uniform

nQuads = 4
plate = ["o", "t", "i", "b"]
ptype = ["s", "l"]
#  cv = {
  #  "os": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
  #  "fs": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
  #  "ss": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
#  };

ostr = '{'
for idx in range(nQuads):
    ostr += '"q%d":' % idx
    ostr += ' {"s": {"o": %d, "t": %d, "i": %d, "b": %d},' % (0, 0, 0, 1)
    ostr += ' "l": {"o": %d, "t": %d, "i": %d, "b": %d}},' % (1, 0, 0, 0)

ostr = ostr[:-1]
ostr += "}"

print(ostr)
