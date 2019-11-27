#!/usr/bin/env python3
import socket
import sys
import time
import serial
import struct
import binascii
import os
import pprint

TCP_IP = '192.168.30.87'
TCP_PORT = 5000
BUFFER_SIZE = 10

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((TCP_IP, TCP_PORT))

regMap = {"fs": "D2",  # width of first step
          "fs2ss": "D3", # delay from start of 1st step to start of 2nd step
          "os": "D7", # width of one-step
          "ss": "D4", # width of 2nd step
          "ss2dis": "D5", # delay from end of 2nd step to discharge
          "dis": "D6" # width of discharge pulse
          }
conversionFactor = {"fs": 9.94,
                    "fs2ss": 9.94,
                    "os": 19.88,
                    "ss": 19.88,
                    "ss2dis": 19.88,
                    "dis": 19.88}

if len(sys.argv) == 1:
    try:
        setpoint = {}
        for (k, v) in regMap.items():
            msg = "RD " + v + " \n"
            s.send(msg.encode())
            data = (s.recv(BUFFER_SIZE)).decode()
            val = int(round(int(data.splitlines()[0], 16) * conversionFactor[k] / 1000))
            setpoint[k] = val
            #  print(k, ":", val)
        pprint.pprint(setpoint)
        s.close()
    except Exception as e:
        print(e)

# oneStep firstStep delay2SecondStep secondStep second2Discharge Discharge
elif len(sys.argv) == len(regMap) + 1:
    setpoint = {"os": int(sys.argv[1]),
                "fs": int(sys.argv[2]),
                "fs2ss": int(sys.argv[3]),
                "ss": int(sys.argv[4]),
                "ss2dis": int(sys.argv[5]),
                "dis": int(sys.argv[6])}


    for (k, v) in setpoint.items():
        print(k, ": ", v * 1000)

    for (k, v) in setpoint.items():
        v = int(v * 1000. / conversionFactor[k])
        msg = "WR " + regMap[k] + " %X\n" % v
        #  print(k, ": ", v, hex(v), msg)
        s.send(msg.encode())
        time.sleep(0.5)
        s.send(msg.encode())

    s.close()

else:
    print("Invalid argument(s), correct usage is [us]:")
    print(sys.argv[0], "oneStep firstStep delay2SecondStep secondStep second2Discharge Discharge")
