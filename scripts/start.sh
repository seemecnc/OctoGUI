#!/bin/bash

if [ -f /home/pi/NOGUI ]
then
  cd /var/www/html/OctoGUI
  res=$(git pull)
  check=$(echo "$res"|grep "up-to-date" -i)
  if [ -z "$check" ]
  then
    sudo bash /var/www/html/OctoGUI/scripts/pi-setup.sh
  fi
  cd /var/www/html/fw
  git pull
else
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
  cd /var/www/html/fw
  git pull

  if [ -f /home/pi/BURNIN ]
  then
    cd /var/www/html/OctoGUI/scripts
    for file in *gcode
    do
      if [ -f /home/pi/.octoprint/uploads/$file ]
      then
        check=$(diff $file /home/pi/.octoprint/uploads/$file)
        if [ -n "$check" ]
        then
          cp -f $file /home/pi/.octoprint/uploads/$file
        fi
      else
        cp $file /home/pi/.octoprint/uploads/$file
      fi
    done
  fi

  sleep 10
  DISPLAY=:0.0 xdotool key ctrl+F5

fi
