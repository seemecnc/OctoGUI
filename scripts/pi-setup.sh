#!/bin/bash
#Set Octoprint API Key and repetier settings
check=$(grep "repetierTargetTemp" /home/pi/.octoprint/config.yaml)
if [ -z "$check" ]
then
  echo "Tweaking settings and restarting octoprint"
  sed -i -e 's/^\ \ key:.*/\ \ key:\ ABAABABB/' -e 's/^plugins/feature:\n\ \ alwaysSendChecksum:\ true\n\ \ externalHeatupDetection:\ false\n\ \ repetierTargetTemp:\ true\nplugins/' /home/pi/.octoprint/config.yaml
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
apt-get install -y raspberrypi-ui-mods lightdm xinit lxterminal lxde-core joe chromium-browser usbmount unclutter nginx php5-fpm php-apc php5-curl xdotool jq

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
check=$(grep "C-A-t" /home/pi/.config/openbox/lxde-pi-rc.xml)
if [ -z "$check" ]
then
  sed /home/pi/.config/openbox/lxde-pi-rc.xml -i -e 's/<keyboard>/<keyboard>\n<keybind key=\"C-A-t\"><action name=\"Execute\"><command>lxterminal<\/command><\/action>\n<\/keybind>/'
fi

#Setup chromium refresh file
cat > /home/pi/refresh-chromium.sh << EOF
#!/bin/bash
OK=0
res=\$(curl -s http://localhost/api/printer?apikey=ABAABABB)
if [ "\$res" == "Printer is not operational" ]; then OK=1;
else
  status=\$(echo "\$res"|jq .state.text|sed -e 's/"//g');
  if [ "\$status" != "Printing" -a "\$status" != "Paused" ]; then OK=1; fi
fi
if [ "\$OK" == "1" ]; then echo "Refreshing Chromium"; DISPLAY=:0.0 /usr/bin/xdotool key ctrl+F5
else
  echo "Print job in progress. Not refreshing. Feel free to do it yourself:"
  echo "DISPLAY=:0.0 /usr/bin/xdotool key ctrl+F5"
  echo
fi
EOF

#Setup uptime check file
cat > /home/pi/ucheck.sh << EOF
#!/bin/bash
let maxuptime=\$(( 24 * 3600))
problem="null"
utime=\$(cat /proc/uptime|cut -f1 -d'.')
if [ \$utime -lt \$maxuptime ]; then echo "Uptime not long enough - \$utime"; problem="uptime"; fi

res=\$(curl -s http://localhost/api/printer?apikey=ABAABABB)
if [ "\$res" != "Printer is not operational" ]; then status=\$(echo "\$res"|jq .state.text|sed -e 's/"//g'); check=\$(echo "\$status"|grep -i Error)
  if [ "\$status" != "Operational" -a -z "\$check" ]; then problem="Status: \$status"; fi
fi

if [ "\$problem" == "null" ]; then sudo /sbin/shutdown -r now; fi
EOF

#Setup crontab
cat > /home/pi/crontab << EOF
1 3 * * * /home/pi/ucheck.sh

EOF
crontab -u pi /home/pi/crontab

#Setup nginx config
cat > /etc/nginx/sites-available/default << EOF
server {
  listen 81 default_server;
  listen [::]:81 default_server;
  root /var/www/html;
  index index.html index.htm;
  server_name _;
  location / {
    try_files \$uri \$uri/ =404;
  }
  location ~\\.php$ {
    fastcgi_pass unix:/var/run/php5-fpm.sock;
    fastcgi_split_path_info ^(.+\\.php)(/.*)$;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
    fastcgi_param HTTPS off;
    try_files \$uri =404;
    include fastcgi_params;
  }
}
EOF

#Create startup file
cat > /home/pi/start.sh << EOF
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
EOF

#Create autostart dir and link startup file
mkdir -p /home/pi/.config/autostart
cat > /home/pi/.config/autostart/chromium.desktop << EOF
[Desktop Entry]
Encoding=UTF-8
Name=Startup
Comment=
Icon=
Exec=/home/pi/start.sh
Terminal=false
Type=Application
Categories=
EOF

#Configure USB automount the way we want it
cat > /etc/usbmount/usbmount.conf << EOF
ENABLED=1
MOUNTPOINTS="/mnt/usb"
FILESYSTEMS="vfat ext2 ext3 ext4 hfsplus"
MOUNTOPTIONS="sync,noexec,nodev,noatime,nodiratime,uid=www-data"
FS_MOUNTOPTIONS=""
VERBOSE=no
EOF

#Overwrite the haproxy config file to redirect /seeme/* to out nginx dir
cat > /etc/haproxy/haproxy.cfg << EOF
global
maxconn 4096
user haproxy
group haproxy
log 127.0.0.1 local1 debug

defaults
log     global
mode    http
option  httplog
option  dontlognull
retries 3
option redispatch
option http-server-close
option forwardfor
maxconn 2000
timeout connect 5s
timeout client  15min
timeout server  15min

frontend public
bind *:80
bind 0.0.0.0:443 ssl crt /etc/ssl/snakeoil.pem
use_backend webcam if { path_beg /webcam/ }
use_backend seeme if { path_beg /seeme/ }
default_backend octoprint
errorfile 503 /etc/haproxy/errors/503-no-octoprint.http

backend octoprint
reqrep ^([^\ :]*)\ /(.*) \1\ /\2
reqadd X-Scheme:\ https if { ssl_fc }
option forwardfor
server octoprint1 127.0.0.1:5000

backend webcam
reqrep ^([^\ :]*)\ /webcam/(.*)     \1\ /\2
server webcam1  127.0.0.1:8080

backend seeme
reqrep ^([^\ :]*)\ /seeme/(.*)     \1\ /\2
server seeme1  127.0.0.1:81
EOF

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

#Fix permissions
chmod 755 /home/pi/*.sh /home/pi/.config/autostart/chromium.desktop
chown -R pi:pi /home/pi/.config /home/pi/*.sh /home/pi/.ssh /home/pi/.bashrc /var/www/html

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
