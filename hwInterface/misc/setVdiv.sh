#!/usr/bin/env bash
echo "Stopping quad-scope service ..."
systemctl --user stop quad-scope
sleep 3
echo "Setting volt-div and time-div ..."
echo "C1:VDIV 500MV" | netcat -q 1 192.168.30.82 5025
sleep 3
echo "C2:VDIV 500MV" | netcat -q 1 192.168.30.82 5025
sleep 3
echo "C3:VDIV 500MV" | netcat -q 1 192.168.30.82 5025
sleep 3
echo "C4:VDIV 500MV" | netcat -q 1 192.168.30.82 5025
sleep 3
echo "TDIV 100US" | netcat -q 1 192.168.30.82 5025
sleep 3

echo "Starting quad-scope service ..."
systemctl --user start quad-scope

echo "Done"
