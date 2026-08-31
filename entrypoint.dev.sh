#!/bin/sh
set -e
 
echo "=== Beacon starting up ==="

# Check if Docker socket is mounted or not
if [ ! -S /var/run/docker.sock ]; then
  echo "ERROR: /var/run/docker.sock not found."
  echo "Run with: -v /var/run/docker.sock:/var/run/docker.sock"
  exit 1
fi
 
# Check if Docker socket is readable or not and also check the permission
if [ ! -r /var/run/docker.sock ]; then
  echo "ERROR: /var/run/docker.sock is not readable. Check permissions/user."
  exit 1
fi
 
echo "Docker socket found. Starting cargo..."
 
exec cargo run -p beacon
