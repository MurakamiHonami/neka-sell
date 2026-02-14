#!/bin/bash
set -e

cd /home/ec2-user/app/api

pkill -f "python3 app.py" || true

nohup python3 app.py > server.log 2>&1 &