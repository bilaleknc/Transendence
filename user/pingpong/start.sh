#!/bin/bash

python3 manage.py makemigrations > log/makemigrations.log
python3 manage.py migrate > log/migrate.log
python3 manage.py runserver 0.0.0.0:8081
