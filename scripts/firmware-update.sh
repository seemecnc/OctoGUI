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
    pc="/dev/ttyACM$p"
    if [ -e $pc ]
    then
      port=$pc
    fi
    let p+=1
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
  if [ "$2" != "-n" ]
  then
    echo -n "Cycling USB bus ... "
    sudo /usr/local/bin/hub-ctrl -h 0 -P 2 -p 0
    sleep 2
    sudo /usr/local/bin/hub-ctrl -h 0 -P 2 -p 1
    echo "DONE"
    sleep 2
    fport=$(getPort)
    if [ -z "$fport" ]; then echo "Error detecting port"; exit 1; fi
    echo "Flashing on $fport"
    avrdude -v -p m2560 -c stk500v2 -P $fport -b 115200 -D -U flash:w:$eclear:i
    sleep 2
  else
    echo "Skipping EEProm clear"
  fi
  echo -n "Cycling USB bus ... "
  sudo /usr/local/bin/hub-ctrl -h 0 -P 2 -p 0
  sleep 2
  sudo /usr/local/bin/hub-ctrl -h 0 -P 2 -p 1
  echo "DONE"
  sleep 3
  fport=$(getPort)
  if [ -z "$fport" ]; then echo "Error detecting port"; exit 1; fi
  echo "Flashing on $fport"
  avrdude -v -p m2560 -c stk500v2 -P $fport -b 115200 -D -U flash:w:$1:i
  echo -n "Waiting for board to init "
  for i in `seq 1 11`
  do
    echo -n "."
    sleep 1
  done
  echo " DONE"
  echo -n "Cycling USB bus ... "
  sudo /usr/local/bin/hub-ctrl -h 0 -P 2 -p 0
  sleep 2
  sudo /usr/local/bin/hub-ctrl -h 0 -P 2 -p 1
  echo "DONE"
  sleep 2
  echo "Reconnecting"
  curl -H "Content-Type: application/json" -X POST -d "{\"command\":\"connect\",\"port\":\"$(getPort)\"}" http://localhost/api/connection?apikey=ABAABABB
else
  echo "Cannot flash firmware when printer is $problem"
fi
