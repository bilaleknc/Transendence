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

.PHONY: build up down logs ps
