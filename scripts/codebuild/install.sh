#!/bin/bash
blue=`tput setaf 4`
magenta=`tput setaf 5`
reset=`tput sgr0`

echo "${magenta}----- INSTALL -----${reset}"

# install sentry cli
curl -sL https://sentry.io/get-cli/ | bash

# run the setup in the root directory which should install all other dependencies
./setup.sh || { echo "Setup script failed"; exit 1; }
