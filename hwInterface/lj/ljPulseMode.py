#!/usr/bin/env python3
import socket
import sys
import time
import argparse
import traceback
from pprint import pprint

TCP_IP = '192.168.30.87'
TCP_PORT = 5000
BUFFER_SIZE = 100

regMap = {"mode": "D0", # 0: stop, 1: burst, 4: ext, 3: periodic
          "period": "D8",
          "d9": "D9"} # what is it for?
modeMap = {"stop": 0,
           "burst": 1,
           "external": 4,
           "periodic": 3}

def main():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((TCP_IP, TCP_PORT))
        setting = {}
        if len(sys.argv) == 1:
            for (k, v) in regMap.items():
                msg = "RD %s \n" % v
                s.send(msg.encode())
                data = (s.recv(BUFFER_SIZE)).decode()
                val = (int(data.splitlines()[0], 16))
                setting[k] = val

            setting["mode"] = setting["mode"] & 0x7

            # iterate through the map, if mode is in the map then assign name
            # accordingly, calculate freq as well in case of periodic mode
            for (k, v) in modeMap.items():
                if setting["mode"] == v:
                    setting["pulseMode"] = k.capitalize()
                    if v == 3:
                        setting["frequency"] = int(1000 / setting["period"])

            # if it is not among those values, set to invalid
            if setting["mode"] not in modeMap.values():
                setting["pulseMode"] = "Invalid"

            pprint(setting)

        elif len(sys.argv) in [2, 3]:
            mode = (sys.argv[1]).lower()
            if mode not in modeMap.keys():
                print("Invalid mode, usage is: %s mode [frequency]" % sys.argv[0],
                      file=sys.stderr)
                sys.exit(-1)

            msg = ["WR %s %X\n" % (regMap["mode"], modeMap[mode])]
            if mode == "periodic":
                msg.insert(0, "WR D8 %X\n" % (int(1000 / int(sys.argv[2]))))
            if mode != "stop":
                msg.insert(0, "WR D9 1F4\n")

            for m in msg:
                s.send(m.encode())
            time.sleep(0.5)
            for m in msg:
                s.send(m.encode())

        s.close()
    except Exception as e:
        traceback.print_exc()
        sys.exit(-1)


if __name__ == "__main__":
    main()
