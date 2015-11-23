#!/bin/bash

# Function for running tests
function run() {
  cmd_output=$($1)
  return_value=$?
  if [ $return_value != 0 ]; then
    echo "Command '$1' failed"
    exit -1
  else
    echo "output: $cmd_output"
    echo "Command succeeded."
  fi
  return $return_value
}

sleep 10

cd app/
run "python test_service.py"
