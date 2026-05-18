include .env
export

COMPOSE_FILE := docker-compose-$(ENV).yml
DATE := $(shell date +%d-%m-%Y)

help: ## Показать список команд
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } \
		/^[a-zA-Z_-]+:.*?## / { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' \
		$(MAKEFILE_LIST)
	@echo ""

##@ Контейнеры
init: down delete-proxy add-proxy up ## Запустить инициализацию проекта

add-proxy: ## Создать общую сеть
	docker network create proxy

delete-proxy: ## Удалить общую сеть
	docker network rm proxy

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
	docker compose -f $(COMPOSE_FILE) logs -f nginx-proxy-manager

logs-db: ## Логи MariaDB
	docker compose -f $(COMPOSE_FILE) logs -f db

logs-pma: ## Логи phpMyAdmin
	docker compose -f $(COMPOSE_FILE) logs -f phpmyadmin

ui: ## Запустить локальный web-интерфейс управления
	@docker build -t infrastructure-ui -f web-ui/Dockerfile .
	@docker run --rm \
		--entrypoint node \
		-p 127.0.0.1:8088:8088 \
		-v "$(PWD):$(PWD)" \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v /etc/hosts:/host/etc/hosts \
		-w "$(PWD)" \
		-e HOSTS_FILE=/host/etc/hosts \
		-e NPM_URL \
		-e NPM_EMAIL \
		-e NPM_PASSWORD \
		infrastructure-ui ./web-ui/server.mjs

##@ Локальные домены и Nginx Proxy Manager
host-add: ## Добавить локальный домен в /etc/hosts, передать DOMAIN=site.local
	@./scripts/hosts.sh add "$(DOMAIN)"

host-remove: ## Удалить локальный домен из /etc/hosts, передать DOMAIN=site.local
	@./scripts/hosts.sh remove "$(DOMAIN)"

NODE = docker run --rm -it -v "$(PWD):/app" -w /app
NODE_IMAGE = node:24-bookworm
app-proxy: ## Создать/обновить Proxy Host в NPM, передать DOMAIN=site.local TARGET=container PORT=80, опционально SSL=1
	@$(NODE) \
		-e NPM_URL \
		-e NPM_EMAIL \
		-e NPM_PASSWORD \
		-e SSL \
		$(NODE_IMAGE) node ./scripts/npm-proxy.mjs \
			--domain "$(DOMAIN)" \
			--target "$(TARGET)" \
			--port "$(PORT)" \
			--scheme "http"

##@ Для работы с Mysql
go-db: ## Вход в shell MariaDB
	docker exec -it mariadb-container sh

import-db-h: ## Импорт SQL дампа (.sql)
	docker exec -i mariadb-container mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME} < ${HOME_DUMP_PATH}${DUMP_NAME}

import-db-gz: ## Импорт сжатого дампа (.sql.gz)
	gunzip -c ${HOME_DUMP_PATH}${DUMP_NAME} | docker exec -i mariadb-container mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME}

upload-dump: ## Загрузка дампа на сервер
	scp ${HOME_DUMP_PATH}${DUMP_NAME} ${SSH}:${SERVER_DUMP_PATH}

##@ Registry
generate-user: ## Создание пользователя Registry
	mkdir -p ./docker/server/registry/auth
	htpasswd -Bbc ./docker/server/registry/auth/htpasswd ${REGISTRY_USER} ${REGISTRY_PASSWORD}

##@ Ansible и сервер
ansible-build: ## Собрать контейнер Ansible
	docker compose -f docker-compose-ansible.yml build

ansible-setup: ## Выполнить установку Ansible на сервере
	docker compose -f docker-compose-ansible.yml run --rm ansible -i inventory.ini deploy.yml

ansible-clean: ## Удалить контейнер Ansible
	docker compose -f docker-compose-ansible.yml down
	docker rmi vennro-ansible 2>/dev/null || true

import-env: ## Импорт .env.server на сервер
	scp -P $(SERVER_PORT) docker/ansible/.env.server $(SSH):$(SERVER_DUMP_PATH).env

##@ S3 Minio
minio-up: ## Запустить контейнер MinIO
	docker compose -f docker-compose-minio.yml up -d

minio-pull: ## Скачать/обновить образ MinIO
	docker compose -f docker-compose-minio.yml pull

minio-stop: ## Остановить контейнер MinIO
	docker compose -f docker-compose-minio.yml stop

minio-clean: ## Удалить контейнер и образ MinIO
	docker compose -f docker-compose-minio.yml down
	docker rmi minio/minio 2>/dev/null || true

##@ Redis
redis-up: ## Запустить контейнер Redis
	docker compose -f docker-compose-redis.yml up -d

redis-pull: ## Скачать/обновить образ Redis
	docker compose -f docker-compose-redis.yml pull

redis-stop: ## Остановить контейнер Redis
	docker compose -f docker-compose-redis.yml stop

redis-clean: ## Удалить контейнер и образ Redis
	docker compose -f docker-compose-redis.yml down
	docker rmi redis:7-alpine 2>/dev/null || true

##@ Postgres
postgres-up: ## Запустить контейнер PostgreSQL
	docker compose -f docker-compose-postgres.yml up -d

postgres-pull: ## Скачать/обновить образ PostgreSQL
	docker compose -f docker-compose-postgres.yml pull

postgres-stop: ## Остановить контейнер PostgreSQL
	docker compose -f docker-compose-postgres.yml stop

postgres-clean: ## Удалить контейнеры и образы PostgreSQL
	docker compose -f docker-compose-postgres.yml down
	docker rmi postgres:16-alpine dpage/pgadmin4 2>/dev/null || true

##@ Rclone
rclone-install: ## Установить rclone на сервер
	sudo -v ; curl https://rclone.org/install.sh | sudo bash

rclone-config: ## Настроить подключение к Яндекс Диску
	rclone config

rclone-test: ## Проверить подключение к Яндекс Диску
	rclone ls yadisk:test-connect/

rclone-backup-s3: ## Создать бекап MinIO на Яндекс Диск
	rclone copy /home/vennro/infrastructure/storage yadisk:backup/storage

##@ Архиватор
archive: ## Архивирование в формате data-DD-MM-YYYY, передать FOLDER=folderName
	tar -czvf "data-$(DATE).tar.gz" "$(FOLDER)/"

unarchive: ## Разархивирование для формата data-DD-MM-YYYY, передать DATE-ARG=DD-MM-YYYY
	tar -xzvf "data-$(DATE-ARG).tar.gz"

clear-mac-copy: ## Очистка файлов MAC в архиве
	find . -type f -name '._*' -delete

##@ Git
push: ## Auto save
	git add .
	git commit -m "update"
	git push

.PHONY: init up down start stop clean
.PHONY: logs-nginx logs-db logs-pma ui go-db
.PHONY: host-add host-remove app-proxy
.PHONY: import-db-h import-db-gz upload-dump
.PHONY: generate-user ansible-build ansible-setup ansible-clean
.PHONY: minio-up minio-pull minio-stop minio-clean
.PHONY: redis-up redis-pull redis-stop redis-clean
.PHONY: rclone-install rclone-config rclone-test rclone-backup-s3
.PHONY: add-proxy delete-proxy
.PHONY: archive unarchive
.PHONY: push help
