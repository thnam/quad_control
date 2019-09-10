#!/bin/bash
QuadToolRoot=$HOME/ESQ/host-carrier.trunk/os/software
if [[ -z $G2QUAD_RUNTIME_PATH ]]; then
  oldDir=$PWD
  cd $QuadToolRoot
  . $QuadToolRoot/env.sh
  cd $oldDir
fi
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$BUTOOL_LINK_PATH/lib:$G2QUAD_RUNTIME_PATH/lib


# vim: ft=sh
