#!/usr/bin/env python3
from InhibitFlagManager import InhibitFlagManager 

def main():
    fMan = InhibitFlagManager()
    fMan.setInhibit()
    print(fMan.readInhibitStatus())
    fMan.clearInhibit()
    print(fMan.readInhibitStatus())
    return 0

if __name__ == "__main__":
    main()
