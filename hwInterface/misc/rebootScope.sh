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

sleep 55
echo "C1:VDIV 500MV" | netcat -q 1 192.168.30.82 5025
sleep 2
echo "C2:VDIV 500MV" | netcat -q 1 192.168.30.82 5025
sleep 2
echo "C3:VDIV 500MV" | netcat -q 1 192.168.30.82 5025
sleep 2
echo "C4:VDIV 500MV" | netcat -q 1 192.168.30.82 5025
sleep 2
echo "TDIV 100US" | netcat -q 1 192.168.30.82 5025
sleep 2

echo "Starting quad-scope service ..."
systemctl --user start quad-scope

echo "Done"
