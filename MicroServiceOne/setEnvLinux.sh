#!/bin/bash
# /IMPORTANT\ Dont forget to run with sh ./
echo "Setting env var"
export mongoUri="mongodb://localhost/app-dev"
export redisDocker="localhost"
export PORT=8000
export openweathermapKey=53b872af80b0e6b661fca7b77b8f037f
export CIRCLE_TEST_REPORTS=test-reports

echo $mongoUri
echo $PORT
echo $redisDocker
