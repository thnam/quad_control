#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
from __future__ import print_function
from labjack import ljm
from argparse import ArgumentParser
from sys import stdout, stderr, argv, exit
from time import sleep

VoltageLabjackIP = '192.168.30.85'
VoltageLabjackDevType = 7
VoltageLabjackConnType = 3

class Channel(object):
    """A HV channel with name, labjack DAC port, and scaling factor"""
    def __init__(self, name, dac, scale):
        super(Channel, self).__init__()
        self.name, self.dac, self.scale = name, dac, scale
        
class AllChannels(object):
    """All high voltage channels"""
    def __init__(self):
        super(AllChannels, self).__init__()
        self.pos = Channel("pos", "TDAC7", 4.)
        self.nos = Channel("nos", "TDAC5", 4.)
        self.pss = Channel("pss", "TDAC1", 4.)
        self.nss = Channel("nss", "TDAC3", 4.)
        self.pfs = Channel("pfs", "TDAC0", 3.)
        self.nfs = Channel("nfs", "TDAC2", 3.)
        
chnDB = AllChannels()

def main(args):
    def SetVoltage(channel, setpoint):
        """Set voltage function, write correct value to an appropriate DAC
    
        :channel: name of channel, must be in [pos, nos, pss, nss, pfs, nfs]
        :setpoint: voltage
        :returns: status
    
        """
        ljm.eWriteName(ljHandle, channel.dac, setpoint / channel.scale)
        pass

    hv = vars(args) # convert arguments into a dictionary hence iterable
    for chn, val in hv.items():
        if val is not None: # validate presented arguments
            try:
                float(val)
            except Exception as e:
                print(val, "(argument for " + chn.upper() +
                      ") could not be interpreted as a float", file=stderr)
                return -1

    # open a connection, verify it then loop through arguments and set voltages
    try:
        ljHandle = ljm.open(VoltageLabjackDevType, VoltageLabjackConnType, 
                            VoltageLabjackIP)
        info = ljm.getHandleInfo(ljHandle)
        
        if info[0] == VoltageLabjackDevType: # verified to be correct device
            # manual list of channels here because the order is important
            # the second steps must be raised before first steps
            for chn in ["pss", "nss", "pos", "nos", "pfs", "nfs"]:
                val = hv[chn];
                if val is not None: # only touch channel specified in arguments
                    chn = getattr(chnDB, chn) # get info from the chnDB
                    print("Setting", chn.name.upper(), "to", val, "using",
                          chn.dac, "(scale factor " + chn.scale.__str__() + ")")
                    # now it is possible to set voltage
                    ljm.eWriteName(ljHandle, chn.dac, float(val) / chn.scale)
                    sleep(0.5)

            ljm.close(ljHandle)
        else: # handle wrong device
            print("Something wrong with Labjack connection, " +
                  "expecting device type " 
                  + VoltageLabjackDevType.__str__()
                  + " but getting type " + info[0].__str__(),
                  file=stderr)
            ljm.close(ljHandle)
            return -1
    except Exception as e: # catch all exception
        print(e, file=stderr)
        return -1


if __name__ == "__main__":
    parser = ArgumentParser( description = "Set voltages on specified channels.")
    parser.add_argument("--pos", help="Positive One Step voltage in kV")
    parser.add_argument("--nos", help="Negative One Step voltage in kV")
    parser.add_argument("--pss", help="Positive Second Step voltage in kV")
    parser.add_argument("--nss", help="Negative Second Step voltage in kV")
    parser.add_argument("--pfs", help="Positive First Step voltage in kV")
    parser.add_argument("--nfs", help="Negative First Step voltage in kV")

    args = parser.parse_args()
    if len(argv) < 2:
        parser.print_help()
        parser.exit(-1)
    else:
        exit(main(args))
