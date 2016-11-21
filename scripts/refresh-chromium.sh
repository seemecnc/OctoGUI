#!/bin/bash
OK=0
res=$(curl -s http://localhost/api/printer?apikey=ABAABABB)
if [ "$res" == "Printer is not operational" ]; then OK=1;
else
  status=$(echo "$res"|jq .state.text|sed -e 's/"//g');
  if [ "$status" != "Printing" -a "$status" != "Paused" ]; then OK=1; fi
fi
if [ "$OK" == "1" ]
then
  if [ "$1" == "-u" ]
  then
    cd /var/www/html/OctoGUI/scripts
    sudo bash pi-setup.sh
  fi
  echo "Refreshing Chromium"
  DISPLAY=:0.0 /usr/bin/xdotool key ctrl+F5
else
  echo "Print job in progress. Not refreshing. Feel free to do it yourself:"
  echo "DISPLAY=:0.0 /usr/bin/xdotool key ctrl+F5"
  echo
fi
