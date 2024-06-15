all:

build:
	docker compose build

up:
	docker compose up

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

re:
	make down
	make build
	make up


makemigrate:
	docker compose exec user python manage.py makemigrations
	docker compose exec user python manage.py migrate



.PHONY: build up down logs ps
