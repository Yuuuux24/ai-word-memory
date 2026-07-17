#!/bin/sh
set -e
echo "Starting gunicorn on port ${PORT:-5000}"
exec gunicorn wsgi:application --bind "0.0.0.0:${PORT:-5000}" --workers 2 --timeout 120
