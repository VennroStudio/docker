include .env
export

COMPOSE_FILE := docker-compose-$(ENV).yml
DATE := $(shell date +%d-%m-%Y)

help: ## Показать список команд
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

init: down delete-proxy add-proxy up ## Запустить инициализацию проекта

up: ## Запуск с пересборкой образов
	docker compose -f $(COMPOSE_FILE) pull && \
	docker compose -f $(COMPOSE_FILE) up -d --build --pull always --force-recreate

down: ## Остановка контейнеров
	docker compose -f $(COMPOSE_FILE) down

start: ## Запуск существующих контейнеров
	docker compose -f $(COMPOSE_FILE) start

stop: ## Остановка контейнеров
	docker compose -f $(COMPOSE_FILE) stop

clean: ## Очистка (удаление volumes)
	docker compose -f $(COMPOSE_FILE) down -v

logs-nginx: ## Логи Nginx
	docker compose -f $(COMPOSE_FILE) logs -f nginx-container

logs-db: ## Логи MariaDB
	docker compose -f $(COMPOSE_FILE) logs -f mariadb-container

logs-pma: ## Логи phpMyAdmin
	docker compose -f $(COMPOSE_FILE) logs -f phpmyadmin-container

go-db: ## Вход в shell MariaDB
	docker exec -it mariadb-container sh

import-env: ## Импорт .env.server на сервер
	scp -P $(SERVER_PORT) docker/ansible/.env.server $(SSH):$(SERVER_DUMP_PATH).env

import-db-h: ## Импорт SQL дампа (.sql)
	docker exec -i mariadb-container mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME} < ${HOME_DUMP_PATH}${DUMP_NAME}

import-db-gz: ## Импорт сжатого дампа (.sql.gz)
	gunzip -c ${HOME_DUMP_PATH}${DUMP_NAME} | docker exec -i mariadb-container mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME}

upload-dump: ## Загрузка дампа на сервер
	scp ${HOME_DUMP_PATH}${DUMP_NAME} ${SSH}:${SERVER_DUMP_PATH}

generate-user: ## Создание пользователя Registry
	mkdir -p ./docker/server/registry/auth
	htpasswd -Bbc ./docker/server/registry/auth/htpasswd ${REGISTRY_USER} ${REGISTRY_PASSWORD}

ansible-build: ## Собрать контейнер Ansible
	docker compose -f docker-compose-ansible.yml build

ansible-setup: ## Выполнить установку Ansible на сервере
	docker compose -f docker-compose-ansible.yml run --rm ansible -i inventory.ini deploy.yml

ansible-clean: ## Удалить контейнер Ansible
	docker compose -f docker-compose-ansible.yml down
	docker rmi vennro-ansible 2>/dev/null || true

minio-up: ## Запустить контейнер MinIO
	docker compose -f docker-compose-minio.yml up -d

minio-pull: ## Скачать/обновить образ MinIO
	docker compose -f docker-compose-minio.yml pull

minio-stop: ## Остановить контейнер MinIO
	docker compose -f docker-compose-minio.yml stop

minio-clean: ## Удалить контейнер и образ MinIO
	docker compose -f docker-compose-minio.yml down
	docker rmi minio/minio 2>/dev/null || true

redis-up: ## Запустить контейнер Redis
	docker compose -f docker-compose-redis.yml up -d

redis-pull: ## Скачать/обновить образ Redis
	docker compose -f docker-compose-redis.yml pull

redis-stop: ## Остановить контейнер Redis
	docker compose -f docker-compose-redis.yml stop

redis-clean: ## Удалить контейнер и образ Redis
	docker compose -f docker-compose-redis.yml down
	docker rmi redis:7-alpine 2>/dev/null || true

rclone-install: ## Установить rclone на сервер
	sudo -v ; curl https://rclone.org/install.sh | sudo bash

rclone-config: ## Настроить подключение к Яндекс Диску
	rclone config

rclone-test: ## Проверить подключение к Яндекс Диску
	rclone ls yadisk:test-connect/

rclone-backup-s3: ## Создать бекап MinIO на Яндекс Диск
	rclone copy /home/vennro/infrastructure/storage yadisk:backup/storage

add-proxy: ## Создать общую сеть
	docker network create proxy

delete-proxy: ## Удалить общую сеть
	docker network rm proxy

archive: ## Архивирование в формате data-DD-MM-YYYY, передать FOLDER=folderName
	tar -czvf "data-$(DATE).tar.gz" "$(FOLDER)/"

unarchive: ## Разархивирование для формата data-DD-MM-YYYY, передать DATE-ARG=DD-MM-YYYY
	tar -xzvf "data-$(DATE-ARG).tar.gz"

push: ## Auto save
	git add .
	git commit -m "update"
	git push

.PHONY: init up down start stop clean
.PHONY: logs-nginx logs-db logs-pma go-db
.PHONY: import-db-h import-db-gz upload-dump
.PHONY: generate-user ansible-build ansible-setup ansible-clean
.PHONY: minio-up minio-pull minio-stop minio-clean
.PHONY: redis-up redis-pull redis-stop redis-clean
.PHONY: rclone-install rclone-config rclone-test rclone-backup-s3
.PHONY: add-proxy delete-proxy
.PHONY: archive unarchive
.PHONY: push help