#!/bin/bash
set -e

cd /home/ec2-user/app

aws ssm get-parameter \
  --region ap-northeast-1 \
  --name "/neka-sell/google-credentials" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text > google-credentials.json

chmod 600 google-credentials.json

python3 -m pip install --upgrade pip

pip install -r requirements.txt