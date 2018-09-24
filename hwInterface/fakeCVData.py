#!/usr/bin/env python36
# -*- coding: utf-8 -*-
#
from random import uniform

pulsers = ["os", "fs", "ss"]
#  cv = {
  #  "os": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
  #  "fs": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
  #  "ss": {"pv": 1., "nv": 1., "pc": 0.1, "nc": 0.1},
#  };

ostr = '{'
for ps in pulsers:
  ostr += '"%s" : {"pv": %.3f, "nv": %.3f, "pc": %.3f, "nc": %.3f},' % (
    ps, uniform(10, 11), uniform(-11, -10), uniform(.1, .2), uniform(-.2, -.1))

ostr += ' "spark": %s}' % float('%.3g' % uniform(-.4, -.2))

print(ostr)
