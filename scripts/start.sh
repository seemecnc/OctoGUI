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
DISPLAY=:0.0 /usr/bin/chromium-browser --kiosk http://localhost/seeme/ --fullscreen 2> /dev/null &
cd /var/www/html/OctoGUI
git pull
sleep 15
DISPLAY=:0.0 xdotool key ctrl+F5
