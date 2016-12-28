#!/bin/bash
if [ -f /home/pi/chromium.tar.gz -a ! -d /tmp/chromium ]
then
  rm -rf /home/pi/.config/chromium
  tar -xzf /home/pi/chromium.tar.gz -C /tmp
  ln -nsf /tmp/chromium /home/pi/.config/chromium
fi
DISPLAY=:0.0 /usr/bin/xset s off
DISPLAY=:0.0 /usr/bin/xset -dpms
DISPLAY=:0.0 /usr/bin/xset s noblank
DISPLAY=:0.0 /usr/bin/unclutter -idle 0.1 &
if [ -f /home/pi/BURNIN ]
then
  DISPLAY=:0.0 /usr/bin/chromium-browser --kiosk http://localhost/seeme/OctoGUI/www/burnin.html --fullscreen 2> /dev/null &
else
  DISPLAY=:0.0 /usr/bin/chromium-browser --kiosk http://localhost/seeme/ --fullscreen 2> /dev/null &
fi
cd /var/www/html/OctoGUI
res=$(git pull)
check=$(echo "$res"|grep "up-to-date" -i)
if [ -z "$check" ]
then
    sudo bash /var/www/html/OctoGUI/scripts/pi-setup.sh
fi
sleep 15
DISPLAY=:0.0 xdotool key ctrl+F5
