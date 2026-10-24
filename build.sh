#!/usr/bin/env bash
set -o errexit

cd src/frontend
npm install
npm run build
cd ../backend
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate