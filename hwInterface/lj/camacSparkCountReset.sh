#!/bin/sh
ssh daq@g2quad-02 './CAMAC/quad_clear_scaler' \
  && /home/daq/ESQ/jscontrol/hwInterface/lj/ljSparkRecover.py
