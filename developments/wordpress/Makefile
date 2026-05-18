include .env
export

.PHONY: help install up down restart logs create-db

help: ## Показать список команд
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } \
		/^[a-zA-Z_-]+:.*?## / { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' \
		$(MAKEFILE_LIST)
	@echo ""

##@ Контейнеры
install: ## Запустить WordPress
	docker-compose -f $(COMPOSE_FILE) up -d

up: ## Поднять контейнеры
	docker-compose -f $(COMPOSE_FILE) up -d

down: ## Остановить и удалить контейнеры
	docker-compose -f $(COMPOSE_FILE) down

restart: ## Перезапустить WordPress
	docker-compose -f $(COMPOSE_FILE) restart

logs: ## Посмотреть логи
	docker-compose -f $(COMPOSE_FILE) logs -f

##@ База данных
create-db: ## Создать базу данных для WordPress
	docker exec -it $(DB_CONTAINER) mariadb -u $(DB_USER) -p$(DB_PASSWORD) -e "CREATE DATABASE IF NOT EXISTS $(DB_NAME) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
