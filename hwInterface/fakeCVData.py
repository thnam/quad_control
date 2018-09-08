#!/usr/bin/env python36
# -*- coding: utf-8 -*-
#
from random import uniform

ostr = '{"fs": ['
N = 4
for idx in range(N):
  num = uniform(0., 10.)
  if idx < N - 1:
    ostr += "%s, " % float('%.4g' % num)
  else:
    ostr += "%s], " % float('%.4g' % num)

ostr += '"ss": ['
for idx in range(N):
  num = uniform(0., 10.)
  if idx < N - 1:
    ostr += "%s, " % float('%.4g' % num)
  else:
    ostr += "%s], " % float('%.4g' % num)

ostr += '"os": ['
for idx in range(N):
  num = uniform(0., 10.)
  if idx < N - 1:
    ostr += "%s, " % float('%.4g' % num)
  else:
    ostr += "%s], " % float('%.4g' % num)

ostr += '"spark": %s}' % float('%.4g' % uniform(0, 2))

print(ostr)
#  {"fs":[-0.010122596193104981, -0.004016786115244031, -0.017893561441451312,
       #  -0.003757877158932388], "ss":[-0.012871468206867576,
                                     #  -0.004980913363397121,
                                     #  -0.0130379106849432,
                                     #  -0.005094340071082115],
 #  "os":[-0.1282246084883809, -0.06329211592674255, -0.12808591593056917,
       #  -0.06083618476986885], "spark":-0.3045865297317505}
