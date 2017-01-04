#!/bin/bash
let maxuptime=$(( 24 * 3600))
problem="null"
utime=$(cat /proc/uptime|cut -f1 -d'.')
if [ $utime -lt $maxuptime ]; then echo "Uptime not long enough - $utime"; problem="uptime"; fi

res=$(curl -s http://localhost/api/printer?apikey=ABAABABB)
if [ "$res" != "Printer is not operational" ]; then status=$(echo "$res"|jq .state.text|sed -e 's/"//g'); check=$(echo "$status"|grep -i Error)
  if [ "$status" != "Operational" -a -z "$check" ]; then problem="Status: $status"; fi
fi

if [ "$problem" == "null" ]
then
  if [ -f /home/pi/NOGUI ]
  then
    sudo service octoprint restart
    cd /var/www/html/OctoGUI
    res=$(git pull)
    check=$(echo "$res"|grep "up-to-date" -i)
    if [ -z "$check" ]
    then
      sudo bash /var/www/html/OctoGUI/scripts/pi-setup.sh
    fi
  else
    sudo /sbin/shutdown -r now
  fi
fi
