#!/bin/bash
echo "RUNNING"
DISPLAY=:0.0 /usr/bin/lxterminal -e "/var/www/html/OctoGUI/scripts/firmware-update.sh $1" > /tmp/OK 2> /tmp/OK
echo "DONE"
