#!/usr/bin/env sh 
host="$1" shift until nc -z $host 3306; do echo "MySQL waiting..." sleep 1 done echo "MySQL started" exec "$@"