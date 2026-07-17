#!/bin/sh
set -eu

cd /app/securematch
python manage.py migrate --noinput

exec gunicorn securematch.wsgi:application --bind 0.0.0.0:8000
