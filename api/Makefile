.PHONY: mysql up down run tidy

mysql:
	docker compose up -d mysql

up: mysql

down:
	docker compose down

tidy:
	go mod tidy

run:
	go run ./cmd/server
