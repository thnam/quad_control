#!/usr/bin/env python36
# -*- coding: utf-8 -*-
from random import uniform

#  {'NOS': [-0.0, 0.0, 0.0],
  #  'NTS': [0.0, 0.4, 0.0],
  #  'POS': [0.0, -0.0, 0.0],
  #  'PTS': [0.0, 0.0, 0.0]}
ostr = '{"nos": ['
N = 3
for idx in range(N):
  num = uniform(0., 10.)
  if idx < N - 1:
    ostr += "%s, " % float('%.4g' % num)
  else:
    ostr += "%s], " % float('%.4g' % num)

ostr += '"nts": ['
for idx in range(N):
  num = uniform(0., 10.)
  if idx < N - 1:
    ostr += "%s, " % float('%.4g' % num)
  else:
    ostr += "%s], " % float('%.4g' % num)

ostr += '"pos": ['
for idx in range(N):
  num = uniform(0., 10.)
  if idx < N - 1:
    ostr += "%s, " % float('%.4g' % num)
  else:
    ostr += "%s], " % float('%.4g' % num)

ostr += '"pts": ['
for idx in range(N):
  num = uniform(0., 10.)
  if idx < N - 1:
    ostr += "%s, " % float('%.4g' % num)
  else:
    ostr += "%s] " % float('%.4g' % num)

ostr += "}"

print(ostr)
