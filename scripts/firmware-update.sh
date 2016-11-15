#!/bin/bash
if [ -z "$1" -o ! -f "$1" ]
then
  echo "You must specify a firmware file"
  exit 1
fi

problem="null"
eclear="/var/www/html/OctoGUI/scripts/eeprom_clear.hex"

res=$(curl -s http://localhost/api/printer?apikey=ABAABABB)
if [ "$res" != "Printer is not operational" ]
then
  check=$(echo "$status"|grep -i Error)
  if [ "$status" != "Operational" -a -z "$check" ]
  then
    problem="Status: $status"
  else
    curl -H "Content-Type: application/json" -X POST -d '{"command":"disconnect"}' http://localhost/api/connection?apikey=ABAABABB
  fi
fi

if [ ! -f "$eclear" ]
then
  echo "eeprom_clear.hex not found"
  exit 1
fi

if [ "$problem" == "null" ]
then
  avrdude -v -p m2560 -c stk500v2 -P /dev/ttyACM0 -b 115200 -D -U flash:w:$eclear:i
  sleep 2
  avrdude -v -p m2560 -c stk500v2 -P /dev/ttyACM0 -b 115200 -D -U flash:w:$1:i
  sleep 15
  curl -H "Content-Type: application/json" -X POST -d '{"command":"connect","port":"/dev/ttyACM0"}' http://localhost/api/connection?apikey=ABAABABB
else
  echo "Cannot flash firmware when printer is $problem"
fi
