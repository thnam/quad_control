#!/usr/bin/env bash
echo "Stopping quad-scope service ..."
systemctl --user stop quad-scope

echo "Rebooting the scope ..."
expect << EOF
spawn telnet 192.168.30.82 2323
expect -re "/ #"
send "reboot\n"
expect -re "/ #"
EOF

sleep 30

echo "Starting quad-scope service ..."
systemctl --user start quad-scope

echo "Done"
