#!/bin/bash
#Set Octoprint API Key and repetier settings
check=$(grep "repetierTargetTemp" /home/pi/.octoprint/config.yaml)
if [ -z "$check" ]
then
  echo "Tweaking settings and restarting octoprint"
  sed -i -e 's/^\ \ key:.*/\ \ key:\ ABAABABB/' /home/pi/.octoprint/config.yaml
  service octoprint restart
  sleep 15
fi

#Setup printer profiles TEST: make sure these stick as octoprint isn't configured yet
res=$(curl -H "Content-Type: application/json" -X POST -d '{ "profile": { "axes": { "e": { "inverted": false, "speed": 300 }, "x": { "inverted": false, "speed": 6000 }, "y": { "inverted": false, "speed": 6000 }, "z": { "inverted": false, "speed": 6000 } }, "color": "default", "current": false, "default": false, "extruder": { "count": 1, "nozzleDiameter": 0.5, "offsets": [ [ 0.0, 0.0 ] ] }, "heatedBed": false, "id": "eris", "model": "Eris", "name": "Eris", "resource": "http://192.168.3.40/api/printerprofiles/eris", "volume": { "depth": 124.0, "formFactor": "circular", "height": 165.0, "origin": "center", "width": 124.0 } } }' http://localhost/api/printerprofiles?apikey=ABAABABB)
check=$( echo "$res"|grep "OctoPrint isn")
if [ -n "$check" ]
then
  echo "Error - Octoprint isn't configured yet. Do that first"
  exit 1
fi
curl -H "Content-Type: application/json" -X POST -d '{ "profile": { "axes": { "e": { "inverted": false, "speed": 300 }, "x": { "inverted": false, "speed": 6000 }, "y": { "inverted": false, "speed": 6000 }, "z": { "inverted": false, "speed": 6000 } }, "color": "default", "current": false, "default": false, "extruder": { "count": 1, "nozzleDiameter": 0.5, "offsets": [ [ 0.0, 0.0 ] ] }, "heatedBed": true, "id": "orion", "model": "Orion", "name": "Orion", "resource": "http://192.168.3.40/api/printerprofiles/orion", "volume": { "depth": 150.0, "formFactor": "circular", "height": 235.0, "origin": "center", "width": 150.0 } } }' http://localhost/api/printerprofiles?apikey=ABAABABB
curl -H "Content-Type: application/json" -X POST -d '{ "profile": { "axes": { "e": { "inverted": false, "speed": 300 }, "x": { "inverted": false, "speed": 6000 }, "y": { "inverted": false, "speed": 6000 }, "z": { "inverted": false, "speed": 6000 } }, "color": "default", "current": false, "default": false, "extruder": { "count": 1, "nozzleDiameter": 0.5, "offsets": [ [ 0.0, 0.0 ] ] }, "heatedBed": true, "id": "rostock_max_v2", "model": "Rostock Max V2", "name": "Rostock Max V2", "resource": "http://192.168.3.40/api/printerprofiles/rostock_max_v2", "volume": { "depth": 275.0, "formFactor": "circular", "height": 400.0, "origin": "center", "width": 275.0 } }}' http://localhost/api/printerprofiles?apikey=ABAABABB
curl -H "Content-Type: application/json" -X POST -d '{ "profile": { "axes": { "e": { "inverted": false, "speed": 300 }, "x": { "inverted": false, "speed": 6000 }, "y": { "inverted": false, "speed": 6000 }, "z": { "inverted": false, "speed": 6000 } }, "color": "default", "current": false, "default": false, "extruder": { "count": 1, "nozzleDiameter": 0.5, "offsets": [ [ 0.0, 0.0 ] ] }, "heatedBed": true, "id": "rostock_max_v3", "model": "Rostock Max V3", "name": "Rostock Max V3", "resource": "http://192.168.3.40/api/printerprofiles/rostock_max_v3", "volume": { "depth": 275.0, "formFactor": "circular", "height": 400.0, "origin": "center", "width": 275.0 } }}' http://localhost/api/printerprofiles?apikey=ABAABABB
curl -H "Content-Type: application/json" -X POST -d '{ "profile": { "axes": { "e": { "inverted": false, "speed": 300 }, "x": { "inverted": false, "speed": 6000 }, "y": { "inverted": false, "speed": 6000 }, "z": { "inverted": false, "speed": 6000 } }, "color": "default", "current": false, "default": false, "extruder": { "count": 1, "nozzleDiameter": 0.5, "offsets": [ [ 0.0, 0.0 ] ] }, "heatedBed": true, "id": "rostock_max_v3_dual", "model": "Rostock Max V3 Dual", "name": "Rostock Max V3 Dual", "resource": "http://192.168.3.40/api/printerprofiles/rostock_max_v3", "volume": { "depth": 275.0, "formFactor": "circular", "height": 400.0, "origin": "center", "width": 275.0 } }}' http://localhost/api/printerprofiles?apikey=ABAABABB
curl -H "Content-Type: application/json" -X POST -d '{ "profile": { "axes": { "e": { "inverted": false, "speed": 300 }, "x": { "inverted": false, "speed": 6000 }, "y": { "inverted": false, "speed": 6000 }, "z": { "inverted": false, "speed": 6000 } }, "color": "default", "current": false, "default": false, "extruder": { "count": 1, "nozzleDiameter": 0.5, "offsets": [ [ 0.0, 0.0 ] ] }, "heatedBed": false, "id": "hacker_h2", "model": "Hacker H2", "name": "Hacker H2", "resource": "http://192.168.3.40/api/printerprofiles/hacker_h2", "volume": { "depth": 150.0, "formFactor": "circular", "height": 295.0, "origin": "center", "width": 150.0 } }}' http://localhost/api/printerprofiles?apikey=ABAABABB
curl -H "Content-Type: application/json" -X POST -d '{ "profile": { "axes": { "e": { "inverted": false, "speed": 300 }, "x": { "inverted": false, "speed": 6000 }, "y": { "inverted": false, "speed": 6000 }, "z": { "inverted": false, "speed": 6000 } }, "color": "default", "current": false, "default": false, "extruder": { "count": 1, "nozzleDiameter": 0.5, "offsets": [ [ 0.0, 0.0 ] ] }, "heatedBed": false, "id": "artemis", "model": "Artemis", "name": "Artemis", "resource": "http://192.168.3.40/api/printerprofiles/artemis", "volume": { "depth": 150.0, "formFactor": "circular", "height": 345.0, "origin": "center", "width": 150.0 } }}' http://localhost/api/printerprofiles?apikey=ABAABABB

check=$(grep bintray /etc/apt/sources.list)
if [ -z "$check" ]
then
  #Stop Octoprint
  service octoprint stop

  #Add Repo for Chromium Packages
  wget -qO - http://bintray.com/user/downloadSubjectPublicKey?username=bintray | sudo apt-key add -
  echo "deb http://dl.bintray.com/kusti8/chromium-rpi jessie main" | sudo tee -a /etc/apt/sources.list

  #Update apt sources and OS
  sudo apt-get update
  sudo apt-get -y dist-upgrade
  apt-get remove -y xscreensaver
  apt-get -y autoremove
  firstrun=1
fi

#Install Required Packages
apt-get install -y raspberrypi-ui-mods lightdm xinit lxterminal lxde-core joe chromium-browser usbmount unclutter nginx php5-fpm php-apc php5-curl xdotool jq avrdude bossa-cli

if [ -f /home/pi/chromium.tar.gz ]
then
  check=$(md5sum /home/pi/chromium.tar.gz|grep 250d0ffd4926c6aa923a72c359ae9fc1)
  if [ -z "$check" ]
  then
    rm -f /home/pi/chromium.tar.gz
  fi
fi

if [ ! -f /home/pi/chromium.tar.gz ]
then
  wget -O /home/pi/chromium.tar.gz https://s3.amazonaws.com/wicker2/chromium.tar.gz
fi

#Add Terminal keyboard shortcut
#check=$(grep "C-A-t" /home/pi/.config/openbox/lxde-pi-rc.xml)
#if [ -z "$check" ]
#then
#  sed /home/pi/.config/openbox/lxde-pi-rc.xml -i -e 's/<keyboard>/<keyboard>\n<keybind key=\"C-A-t\"><action name=\"Execute\"><command>lxterminal<\/command><\/action>\n<\/keybind>/'
#fi

mkdir -p /home/pi/.ssh /mnt/usb

#Temporary: SSH key for quick access
check=$(grep knowhere /home/pi/.ssh/authorized_keys)
if [ -z "$check" ]
then
  echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCmXQtGX/xnhexhPr/RLEIej5FhT5KDtxptAsZfRnPXkFtib8iwAsnhPRRQBy3olJFCnuSag/pGd9BHmJhDtQdS+JxzEh6S4aCT02ulQ2wAAIJWEWCrf8hDdkM8Nf27p83C07+k3LMEUjQN9VY+gIS2xAkoSnzaDjxUKdCmz4cx1OlUlKKCn2cvvW9YfaGtG/VymD2MyifAvH1PUWTyKxWQpCYChmPw7zrbMG1lrWIc2JYejQ1oc6iavovbE5lihqbasLP8FHSfuqJKDG0qy2IAoyfViHInPz/zsZ0IdNrrIAyQHgCQxK3SX60UmRVWc7nNqfeBzTrmdzq2EVC0scJB ryan@knowhere" >> /home/pi/.ssh/authorized_keys
fi

check=$(grep "alias refresh='/" /home/pi/.bashrc)
if [ -z "$check" ]
then
  echo -e "\nalias refresh='/home/pi/refresh-chromium.sh'" >> /home/pi/.bashrc
fi

#make /tmp a ramdisk
check=$(grep "tmp tmpfs" /etc/fstab)
if [ -z "$check" ]
then
  echo "tmpfs /tmp tmpfs defaults,noatime,nosuid,size=300m 0 0" >> /etc/fstab
fi

#Install OctoGUI from git if it's not already there
if [ ! -d /var/www/html/OctoGUI ]
then
  cd /var/www/html
  git clone https://github.com/seemecnc/OctoGUI
fi
chown -R pi:pi /var/www/html/OctoGUI

#Clone Firmware from git if it's not already there
if [ ! -d /var/www/html/Firmware ]
then
  cd /var/www/html
  sudo -u pi git clone https://github.com/seemecnc/Firmware
  ln -nsf /var/www/html/Firmware/Repetier\ Firmware fw
fi

osfiles="refresh-chromium.sh:/home/pi/refresh-chromium.sh ucheck.sh:/home/pi/ucheck.sh default:/etc/nginx/sites-available/default start.sh:/home/pi/start.sh firmware-update.sh:/home/pi/firmware-update.sh"
osfiles="$osfiles chromium.desktop:/home/pi/.config/autostart/chromium.desktop usbmount.conf:/etc/usbmount/usbmount.conf haproxy.cfg:/etc/haproxy/haproxy.cfg hub-ctrl:/usr/local/bin/hub-ctrl"
osfiles="$osfiles sudo-octogui:/etc/sudoers.d/octogui"

for o in $osfiles
do
  gfile="/var/www/html/OctoGUI/scripts/"$(echo "$o"|cut -f1 -d':')
  ofile=$(echo "$o"|cut -f2 -d':')
  check=$(diff "$ofile" "$gfile")
  if [ -n "$check" -o ! -f "$ofile" ]
  then
    cp -fv "$gfile" "$ofile"
  fi
done

#Fix permissions
chmod 755 /home/pi/*.sh /home/pi/.config/autostart/chromium.desktop
chown -R pi:pi /home/pi/.config /home/pi/*.sh /home/pi/.ssh /home/pi/.bashrc /var/www/html /usr/local/bin/hub-ctrl

crontab -u pi /var/www/html/OctoGUI/scripts/CRONTAB

ln -nsf /var/www/html/OctoGUI/www/include /var/www/html/include
ln -nsf /var/www/html/OctoGUI/www/fonts /var/www/html/fonts
ln -nsf /var/www/html/OctoGUI/www/css /var/www/html/css
ln -nsf /var/www/html/OctoGUI/www/images /var/www/html/images
ln -nsf /var/www/html/OctoGUI/www/index.html /var/www/html/index.html

#disable voltage warning
check=$(grep "^avoid_warnings" /boot/config.txt)
if [ -z "$check" ]
then
  echo -e "\navoid_warnings=1" >> /boot/config.txt
fi

#uncork the usb power bus
check=$(grep "max_usb_current" /boot/config.txt)
if [ -z "$check" ]
then
  echo -e "\nmax_usb_current=1" >> /boot/config.txt
fi

#rotate the touchscreen
check=$(grep "lcd_rotate" /boot/config.txt)
if [ -z "$check" ]
then
  echo -e "\nlcd_rotate=2" >> /boot/config.txt
fi

#Custom setup before rebooting
if [ -n "$firstrun" ]
then
  raspi-config
fi

echo
echo "Setup complete. Please reboot"
echo
