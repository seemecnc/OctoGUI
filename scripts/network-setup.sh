#!/bin/bash

if [ -z "$1" ]
then
  echo "## Wired DHCP" > /boot/octopi-network.txt
else
  if [ -n "$2" ]
  then
    echo "## WPA/WPA2 secured" > /boot/octopi-network.txt
    echo "    wpa-ssid \"$1\"" >> /boot/octopi-network.txt
    echo "    wpa-psk \"$2\"" >> /boot/octopi-network.txt
  else
    echo "## unsecured wifi" > /boot/octopi-network.txt
    echo "    wpa-ssid \"$1\"" >> /boot/octopi-network.txt
    echo "    wireless-mode managed" >> /boot/octopi-network.txt
  fi
fi

/usr/sbin/service networking restart

