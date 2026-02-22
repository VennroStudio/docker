include .env
export

COMPOSE_FILE := docker-compose-$(ENV).yml

init: down up

up:
	docker compose -f $(COMPOSE_FILE) pull && \
	docker compose -f $(COMPOSE_FILE) up -d --build --pull always --force-recreate

down:
	docker compose -f $(COMPOSE_FILE) down

start:
	docker compose -f $(COMPOSE_FILE) start

stop:
	docker compose -f $(COMPOSE_FILE) stop

clean:
	docker compose -f $(COMPOSE_FILE) down -v

logs-nginx:
	docker compose -f $(COMPOSE_FILE) logs -f nginx-container

logs-db:
	docker compose -f $(COMPOSE_FILE) logs -f mariadb-container

logs-pma:
	docker compose -f $(COMPOSE_FILE) logs -f phpmyadmin-container

go-db:
	docker exec -it mariadb-container sh

import-db-h:
	docker exec -i mariadb-container mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME} < ${HOME_DUMP_PATH}${DUMP_NAME}

import-db-gz:
	gunzip -c ${HOME_DUMP_PATH}${DUMP_NAME} | docker exec -i mariadb-container mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME}

upload-dump:
	scp ${HOME_DUMP_PATH}${DUMP_NAME} ${SSH}:${SERVER_DUMP_PATH}

generate-user:
	mkdir -p ./docker/server/registry/auth
	htpasswd -Bbc ./docker/server/registry/auth/htpasswd ${REGISTRY_USER} ${REGISTRY_PASSWORD}

push:
	git add .
	git commit -m "update"
	git push

help:
	@echo "Доступные команды:"
	@echo "  make init           - Полная перезагрузка (down + up)"
	@echo "  make up             - Запуск с пересборкой образов"
	@echo "  make down           - Остановка контейнеров"
	@echo "  make start          - Запуск существующих контейнеров"
	@echo "  make stop           - Остановка контейнеров"
	@echo "  make clean          - Очистка (удаление volumes)"
	@echo "  make logs-nginx     - Логи Nginx"
	@echo "  make logs-db        - Логи MariaDB"
	@echo "  make logs-pma       - Логи phpMyAdmin"
	@echo "  make go-db          - Вход в shell MariaDB"
	@echo "  make import-db-h    - Импорт SQL дампа (.sql)"
	@echo "  make import-db-gz   - Импорт сжатого дампа (.sql.gz)"
	@echo "  make upload-dump    - Загрузка дампа на сервер"
	@echo "  make generate-user  - Создание пользователя Registry"

.PHONY: init up down start stop clean logs-nginx logs-db logs-pma go-db import-db-h import-db-gz upload-dump generate-user push help
