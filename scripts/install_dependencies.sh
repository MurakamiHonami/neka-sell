#!/bin/bash
set -e

cd /home/ec2-user/app


python3 -m pip install --upgrade pip

pip install -r requirements.txt