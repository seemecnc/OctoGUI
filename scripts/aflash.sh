#!/bin/bash

echo "RUNNING"
if [ -n "$1" ]
then
  check=$(lsusb|grep '1781:0c9f')
  if [ -n "$check" ]; then board=usbtiny;
  else board=avrispmkII; fi
else
  echo "You must specify a file to flash"
fi

#DISPLAY=:0.0 /usr/bin/lxterminal -e "avrdude -p t861 -c $board -U flash:w:$1" > /tmp/OK 2> /tmp/OK
avrdude -p t861 -c $board -U flash:w:$1
echo "DONE"
