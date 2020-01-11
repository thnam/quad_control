#!/usr/bin/env python3
import argparse
from InhibitFlagManager import InhibitFlagManager

def main(args):
    """Docstring for main.

    :args: all the arguments from parser
    :returns: 0 if succesful, -1 if failed

    """
    try:
        fMan = InhibitFlagManager()
    except Exception as e:
        print(e)
        return -1

    if args.read:
        print(fMan.readInhibitStatus())
        return 0
    elif args.set:
        fMan.setInhibit()
        return 0
    elif args.clear:
        fMan.clearInhibit()
        return 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description = 'Read/set the global inhibit flag.\n'
        'Only one switch read/set/clear should be provided. If multiple'
        'switches are present, only one will be considered with following '
        'priority: read > set > clear.'
    )
    parser.add_argument('--read', help='read the flag', action='store_true')
    parser.add_argument('--set', help='set the flag to 1', action='store_true')
    parser.add_argument('--clear', help='clear the flag, i.e. set to 0', action='store_true')

    args = parser.parse_args()

    if not args.read and not args.set and not args.clear:
        parser.print_help()
        parser.exit(-1)
    else:
        main(args)
