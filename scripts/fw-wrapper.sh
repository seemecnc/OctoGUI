#!/bin/bash
echo "RUNNING"
if [ "$2" == "-n" ]
then
  DISPLAY=:0.0 /usr/bin/lxterminal -e "/var/www/html/OctoGUI/scripts/firmware-update.sh $1 -n" > /tmp/OK 2> /tmp/OK
else
  DISPLAY=:0.0 /usr/bin/lxterminal -e "/var/www/html/OctoGUI/scripts/firmware-update.sh $1" > /tmp/OK 2> /tmp/OK
fi
echo "DONE"
