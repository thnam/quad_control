#!/bin/bash

QuadToolRoot=~/work/gm2/esq/host-carrier.trunk/os/software
if [[ -z $G2QUAD_RUNTIME_PATH ]]; then
  oldDir=$PWD
  cd $QuadToolRoot
  . $QuadToolRoot/env.sh
  cd $oldDir
fi

/home/gm2/work/gm2/esq/jscontrol/hwInterface/setPulseMode -m "$1"

# vim: ft=sh
