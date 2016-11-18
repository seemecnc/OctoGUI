#!/bin/bash
if [ -z "$1" -o ! -f "$1" ]
then
  echo "You must specify a firmware file"
  exit 1
fi

function getPort {
  let p=0
  while [ $p -lt 9 -a -z "$port" ]
  do
    if [ -e /dev/ttyACM$p ]
    then
      port=/dev/ttyACM$p
    fi
  done
  if [ -n "$port" ]
  then
    echo $port
  else
    exit 1
  fi
}

problem="null"
eclear="/var/www/html/OctoGUI/scripts/eeprom_clear.hex"

status=$(curl -s http://localhost/api/printer?apikey=ABAABABB)
if [ "$status" != "Printer is not operational" ]
then
  check=$(echo "$status"|grep -i Error)
  if [ "$status" != "Operational" -a -z "$check" ]
  then
    problem="$status"
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
  echo -n "Cycling USB bus ... "
  sudo /usr/local/bin/hub-ctrl -h 0 -P 2 -p 0
  sleep 2
  sudo /usr/local/bin/hub-ctrl -h 0 -P 2 -p 1
  echo "DONE"
  sleep 2
  avrdude -v -p m2560 -c stk500v2 -P $(getPort) -b 115200 -D -U flash:w:$eclear:i
  sleep 2
  echo -n "Cycling USB bus ... "
  sudo /usr/local/bin/hub-ctrl -h 0 -P 2 -p 0
  sleep 2
  sudo /usr/local/bin/hub-ctrl -h 0 -P 2 -p 1
  echo "DONE"
  sleep 2
  avrdude -v -p m2560 -c stk500v2 -P $(getPort) -b 115200 -D -U flash:w:$1:i
  sleep 15
  curl -H "Content-Type: application/json" -X POST -d "{\"command\":\"connect\",\"port\":\"$(getPort)\"}" http://localhost/api/connection?apikey=ABAABABB
else
  echo "Cannot flash firmware when printer is $problem"
fi
