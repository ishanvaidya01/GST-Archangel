.PHONY: up down seed logs test

up:
	docker-compose up -d --build

down:
	docker-compose down -v

seed:
	docker-compose exec -T backend python -m app.db.seed

logs:
	docker-compose logs -f

test:
	docker-compose exec -T backend pytest app/tests -v
