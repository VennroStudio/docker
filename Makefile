-include .env
export

COMPOSE_DIR := docker/compose
COMPOSE_ENV := $(if $(wildcard .env),--env-file .env,)
ANSIBLE_COMPOSE := docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-ansible.yml --profile deploy
MINIO_COMPOSE := docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-minio.yml
NPM_COMPOSE := docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-npm.yml
PHPMYADMIN_COMPOSE := docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-phpmyadmin.yml
PGADMIN_COMPOSE := docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-pgadmin.yml
REDIS_COMPOSE := docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-redis.yml
REDISINSIGHT_COMPOSE := docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-redisinsight.yml
REGISTRY_COMPOSE := docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-registry.yml
REGISTRY_UI_COMPOSE := docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-registry-ui.yml
WEB_UI_COMPOSE = PWD="$(CURDIR)" docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-web-ui.yml
DATE := $(shell date +%d-%m-%Y)
NODE = docker run --rm -v "$(PWD):/app" -w /app
NODE_IMAGE ?= node:$(if $(NODE_LIBRARY),$(NODE_LIBRARY),24-bookworm)
NODE_BIN ?= node

help: ## Показать список команд
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } \
		/^[a-zA-Z_-]+:.*?## / { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' \
		$(MAKEFILE_LIST)
	@echo ""

##@ Проект
init: ## Первый запуск: создать локальные env/config файлы без перезаписи существующих
	@cp -n .env.example .env 2>/dev/null || true
	@mkdir -p docker/compose docker/mariadb docker/nginx docker/phpmyadmin docker/postgres docker/registry docker/services dumps/mariadb dumps/postgres
	@[ -f docker/mariadb/instances.json ] || printf "[]\n" > docker/mariadb/instances.json
	@[ -f docker/postgres/instances.json ] || printf "[]\n" > docker/postgres/instances.json
	@$(NODE) $(NODE_IMAGE) node ./scripts/mariadb-instances.mjs generate
	@echo "Init complete. Check .env and run make ui"

##@ Docker network
proxy-network-ensure: ## Создать общую сеть proxy, если ее еще нет
	@docker network inspect proxy >/dev/null 2>&1 || docker network create proxy

add-proxy: ## Создать общую сеть
	docker network create proxy

delete-proxy: ## Удалить общую сеть
	docker network rm proxy

##@ Web UI
ui: web-ui-up ## Запустить локальный web-интерфейс управления

web-ui-up: proxy-network-ensure ## Собрать и запустить Web UI
	$(WEB_UI_COMPOSE) up -d --build

web-ui-build: ## Собрать образ Web UI
	$(WEB_UI_COMPOSE) build

web-ui-start: ## Запустить существующий контейнер Web UI
	$(WEB_UI_COMPOSE) start

web-ui-stop: ## Остановить контейнер Web UI
	$(WEB_UI_COMPOSE) stop

web-ui-down: ## Удалить контейнер Web UI
	$(WEB_UI_COMPOSE) down

web-ui-clean: ## Удалить контейнер и образ Web UI
	$(WEB_UI_COMPOSE) down
	docker rmi web-ui 2>/dev/null || true

web-ui-logs: ## Логи Web UI
	$(WEB_UI_COMPOSE) logs -f web-ui

##@ Локальные домены и Nginx Proxy Manager
host-add: ## Добавить локальный домен в /etc/hosts, передать DOMAIN=site.local
	@./scripts/hosts.sh add "$(DOMAIN)"

host-remove: ## Удалить локальный домен из /etc/hosts, передать DOMAIN=site.local
	@./scripts/hosts.sh remove "$(DOMAIN)"

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

app-proxy-remove: ## Удалить Proxy Host и SSL из NPM, передать DOMAIN=site.local
	@$(NODE) \
		-e NPM_URL \
		-e NPM_EMAIL \
		-e NPM_PASSWORD \
		$(NODE_IMAGE) node ./scripts/npm-proxy.mjs \
			--delete \
			--domain "$(DOMAIN)"

##@ Nginx Proxy Manager
npm-up: ## Запустить контейнер NPM
	$(NPM_COMPOSE) up -d

npm-pull: ## Скачать/обновить образ NPM
	$(NPM_COMPOSE) pull

npm-start: ## Запустить существующий контейнер NPM
	$(NPM_COMPOSE) start

npm-stop: ## Остановить контейнер NPM
	$(NPM_COMPOSE) stop

npm-down: ## Удалить контейнер NPM
	$(NPM_COMPOSE) down

npm-clean: ## Удалить контейнер и образ NPM
	$(NPM_COMPOSE) down
	docker rmi jc21/nginx-proxy-manager:latest 2>/dev/null || true

npm-logs: ## Логи NPM
	$(NPM_COMPOSE) logs -f nginx-proxy-manager

##@ MariaDB
mariadb-shell: ## Shell MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_BIN) ./scripts/mariadb-instances.mjs run --action shell

mariadb-import: ## Импорт .sql/.sql.gz дампа, передать DATABASE=wp DUMP_FILE=dumps/mariadb/app.sql, опционально NAME=... или CONTAINER=...
	@$(NODE_BIN) ./scripts/mariadb-import.mjs

mariadb-export: ## Экспорт .sql/.sql.gz дампа, передать DATABASE=wp DUMP_FILE=dumps/mariadb/app.sql.gz, опционально NAME=... или CONTAINER=...
	@$(NODE_BIN) ./scripts/mariadb-export.mjs

mariadb-db-list: ## Показать базы MariaDB, опционально NAME=... или CONTAINER=...
	@$(NODE_BIN) ./scripts/mariadb-databases.mjs list

mariadb-db-create: ## Создать базу MariaDB, передать DATABASE=app, опционально NAME=... или CONTAINER=...
	@$(NODE_BIN) ./scripts/mariadb-databases.mjs create --database "$(DATABASE)"

mariadb-db-drop: ## Удалить базу MariaDB, передать DATABASE=app, опционально NAME=... или CONTAINER=...
	@$(NODE_BIN) ./scripts/mariadb-databases.mjs drop --database "$(DATABASE)"

mariadb-dump-upload: ## Загрузить дамп на сервер, передать FILE=dumps/mariadb/app.sql TARGET_PATH=/remote/path/
	@file="$${FILE:-$${DUMP_FILE}}"; \
	if [ -z "$$file" ]; then echo "FILE or DUMP_FILE is required"; exit 1; fi; \
	if [ -z "$(TARGET_PATH)" ]; then echo "TARGET_PATH is required"; exit 1; fi; \
	scp "$$file" "$(SSH):$(TARGET_PATH)"

##@ phpMyAdmin
phpmyadmin-up: ## Запустить контейнер phpMyAdmin
	$(PHPMYADMIN_COMPOSE) up -d

phpmyadmin-pull: ## Скачать/обновить образ phpMyAdmin
	$(PHPMYADMIN_COMPOSE) pull

phpmyadmin-start: ## Запустить существующий контейнер phpMyAdmin
	$(PHPMYADMIN_COMPOSE) start

phpmyadmin-stop: ## Остановить контейнер phpMyAdmin
	$(PHPMYADMIN_COMPOSE) stop

phpmyadmin-down: ## Удалить контейнер phpMyAdmin
	$(PHPMYADMIN_COMPOSE) down

phpmyadmin-clean: ## Удалить контейнер и образ phpMyAdmin
	$(PHPMYADMIN_COMPOSE) down
	docker rmi phpmyadmin/phpmyadmin 2>/dev/null || true

phpmyadmin-logs: ## Логи phpMyAdmin
	$(PHPMYADMIN_COMPOSE) logs -f phpmyadmin

phpmyadmin-config-generate: ## Перегенерировать список серверов phpMyAdmin
	@$(NODE) $(NODE_IMAGE) node ./scripts/mariadb-instances.mjs generate

phpmyadmin-reload: ## Перезапустить phpMyAdmin после изменения списка серверов
	$(PHPMYADMIN_COMPOSE) restart

##@ MariaDB instances
mariadb-instance-add: ## Создать MariaDB instance, передать VERSION=11.4 DB_USER=admin PASSWORD=secret ROOT_PASSWORD=root-secret, опционально PORT=3307 AUTH_MODE=config|cookie
	@$(NODE) $(NODE_IMAGE) node ./scripts/mariadb-instances.mjs add \
		--version "$(VERSION)" \
		--user "$(DB_USER)" \
		--password "$(PASSWORD)" \
		--root-password "$(ROOT_PASSWORD)" \
		$(if $(PORT),--port "$(PORT)",) \
		$(if $(AUTH_MODE),--auth-mode "$(AUTH_MODE)",)

mariadb-instance-list: ## Показать MariaDB instances
	@$(NODE) $(NODE_IMAGE) node ./scripts/mariadb-instances.mjs list

mariadb-instance-generate: ## Перегенерировать phpMyAdmin servers config
	@$(NODE) $(NODE_IMAGE) node ./scripts/mariadb-instances.mjs generate

mariadb-instance-up: ## Запустить MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_BIN) ./scripts/mariadb-instances.mjs run --action up

mariadb-instance-start: ## Запустить существующий MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_BIN) ./scripts/mariadb-instances.mjs run --action start

mariadb-instance-stop: ## Остановить MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_BIN) ./scripts/mariadb-instances.mjs run --action stop

mariadb-instance-down: ## Удалить контейнер MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_BIN) ./scripts/mariadb-instances.mjs run --action down

mariadb-instance-clean: ## Удалить контейнер и образ MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_BIN) ./scripts/mariadb-instances.mjs run --action clean

mariadb-instance-logs: ## Логи MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_BIN) ./scripts/mariadb-instances.mjs run --action logs

mariadb-instance-shell: ## Shell MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_BIN) ./scripts/mariadb-instances.mjs run --action shell

##@ Registry
generate-user: ## Создание пользователя Registry
	mkdir -p ./docker/registry/auth
	htpasswd -Bbc ./docker/registry/auth/htpasswd ${REGISTRY_USER} ${REGISTRY_PASSWORD}

registry-up: ## Запустить контейнер Registry
	$(REGISTRY_COMPOSE) up -d

registry-pull: ## Скачать/обновить образ Registry
	$(REGISTRY_COMPOSE) pull

registry-start: ## Запустить существующий контейнер Registry
	$(REGISTRY_COMPOSE) start

registry-stop: ## Остановить контейнер Registry
	$(REGISTRY_COMPOSE) stop

registry-down: ## Удалить контейнер Registry
	$(REGISTRY_COMPOSE) down

registry-clean: ## Удалить контейнер и образ Registry
	$(REGISTRY_COMPOSE) down
	docker rmi registry:2 2>/dev/null || true

registry-logs: ## Логи Registry
	$(REGISTRY_COMPOSE) logs -f

##@ Registry UI
registry-ui-up: ## Запустить контейнер Registry UI
	$(REGISTRY_UI_COMPOSE) up -d

registry-ui-pull: ## Скачать/обновить образ Registry UI
	$(REGISTRY_UI_COMPOSE) pull

registry-ui-start: ## Запустить существующий контейнер Registry UI
	$(REGISTRY_UI_COMPOSE) start

registry-ui-stop: ## Остановить контейнер Registry UI
	$(REGISTRY_UI_COMPOSE) stop

registry-ui-down: ## Удалить контейнер Registry UI
	$(REGISTRY_UI_COMPOSE) down

registry-ui-clean: ## Удалить контейнер и образ Registry UI
	$(REGISTRY_UI_COMPOSE) down
	docker rmi joxit/docker-registry-ui:latest 2>/dev/null || true

registry-ui-logs: ## Логи Registry UI
	$(REGISTRY_UI_COMPOSE) logs -f

##@ Ansible и сервер
ansible-build: ## Собрать контейнер Ansible
	$(ANSIBLE_COMPOSE) build

ansible-setup: ## Выполнить установку Ansible на сервере
	$(ANSIBLE_COMPOSE) run --rm ansible -i inventory.ini deploy.yml

ansible-clean: ## Удалить контейнер Ansible
	$(ANSIBLE_COMPOSE) down
	docker rmi vennro-ansible 2>/dev/null || true

import-env: ## Импорт .env.server на сервер, передать TARGET_PATH=/remote/project/.env
	@if [ -z "$(TARGET_PATH)" ]; then echo "TARGET_PATH is required"; exit 1; fi
	scp -P $(SERVER_PORT) docker/ansible/.env.server $(SSH):$(TARGET_PATH)

##@ S3 Minio
minio-up: ## Запустить контейнер MinIO
	$(MINIO_COMPOSE) up -d

minio-pull: ## Скачать/обновить образ MinIO
	$(MINIO_COMPOSE) pull

minio-start: ## Запустить существующий контейнер MinIO
	$(MINIO_COMPOSE) start

minio-stop: ## Остановить контейнер MinIO
	$(MINIO_COMPOSE) stop

minio-down: ## Удалить контейнер MinIO
	$(MINIO_COMPOSE) down

minio-clean: ## Удалить контейнер и образ MinIO
	$(MINIO_COMPOSE) down
	docker rmi minio/minio 2>/dev/null || true

minio-logs: ## Логи MinIO
	$(MINIO_COMPOSE) logs -f

##@ Redis
redis-up: ## Запустить контейнер Redis
	$(REDIS_COMPOSE) up -d

redis-pull: ## Скачать/обновить образ Redis
	$(REDIS_COMPOSE) pull

redis-start: ## Запустить существующие контейнеры Redis
	$(REDIS_COMPOSE) start

redis-stop: ## Остановить контейнер Redis
	$(REDIS_COMPOSE) stop

redis-down: ## Удалить контейнер Redis
	$(REDIS_COMPOSE) down

redis-clean: ## Удалить контейнер и образ Redis
	$(REDIS_COMPOSE) down
	docker rmi redis:7-alpine 2>/dev/null || true

redis-logs: ## Логи Redis
	$(REDIS_COMPOSE) logs -f

##@ RedisInsight
redisinsight-up: ## Запустить контейнер RedisInsight
	$(REDISINSIGHT_COMPOSE) up -d

redisinsight-pull: ## Скачать/обновить образ RedisInsight
	$(REDISINSIGHT_COMPOSE) pull

redisinsight-start: ## Запустить существующий контейнер RedisInsight
	$(REDISINSIGHT_COMPOSE) start

redisinsight-stop: ## Остановить контейнер RedisInsight
	$(REDISINSIGHT_COMPOSE) stop

redisinsight-down: ## Удалить контейнер RedisInsight
	$(REDISINSIGHT_COMPOSE) down

redisinsight-clean: ## Удалить контейнер и образ RedisInsight
	$(REDISINSIGHT_COMPOSE) down
	docker rmi redis/redisinsight:latest 2>/dev/null || true

redisinsight-logs: ## Логи RedisInsight
	$(REDISINSIGHT_COMPOSE) logs -f

##@ Postgres
postgres-up: ## Запустить Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action up

postgres-start: ## Запустить существующий Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action start

postgres-stop: ## Остановить Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action stop

postgres-down: ## Удалить контейнер Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action down

postgres-clean: ## Удалить контейнер и образ Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action clean

postgres-logs: ## Логи Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action logs

postgres-shell: ## Shell Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action shell

postgres-import: ## Импорт .sql/.sql.gz/.dump дампа, передать POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.sql, опционально NAME=... или CONTAINER=...
	@$(NODE_BIN) ./scripts/postgres-import.mjs

postgres-export: ## Экспорт .sql/.sql.gz/.dump дампа, передать POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.dump, опционально NAME=... или CONTAINER=...
	@$(NODE_BIN) ./scripts/postgres-export.mjs

postgres-db-list: ## Показать базы Postgres, опционально NAME=... или CONTAINER=...
	@$(NODE_BIN) ./scripts/postgres-databases.mjs list

postgres-db-create: ## Создать базу Postgres, передать DATABASE=app, опционально NAME=... или CONTAINER=...
	@$(NODE_BIN) ./scripts/postgres-databases.mjs create --database "$(DATABASE)"

postgres-db-drop: ## Удалить базу Postgres, передать DATABASE=app, опционально NAME=... или CONTAINER=...
	@$(NODE_BIN) ./scripts/postgres-databases.mjs drop --database "$(DATABASE)"

postgres-dump-upload: ## Загрузить Postgres dump на сервер, передать FILE=dumps/postgres/app.dump, опционально TARGET_PATH=/remote/path/
	@file="$${FILE:-$${DUMP_FILE:-$${POSTGRES_HOME_DUMP_PATH}$${POSTGRES_DUMP_NAME}}}"; \
	if [ -z "$$file" ]; then echo "FILE or DUMP_FILE is required"; exit 1; fi; \
	target_path="$${TARGET_PATH:-$${POSTGRES_SERVER_DUMP_PATH}}"; \
	if [ -z "$$target_path" ]; then echo "TARGET_PATH or POSTGRES_SERVER_DUMP_PATH is required"; exit 1; fi; \
	scp "$$file" "$(SSH):$$target_path"

##@ Postgres instances
postgres-instance-add: ## Создать Postgres instance, передать VERSION=17 DB_USER=admin PASSWORD=secret DATABASE=app
	@$(NODE) $(NODE_IMAGE) node ./scripts/postgres-instances.mjs add \
		--version "$(VERSION)" \
		--user "$(DB_USER)" \
		--password "$(PASSWORD)" \
		--database "$(DATABASE)"

postgres-instance-list: ## Показать Postgres instances
	@$(NODE) $(NODE_IMAGE) node ./scripts/postgres-instances.mjs list

postgres-instance-up: ## Запустить Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action up

postgres-instance-start: ## Запустить существующий Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action start

postgres-instance-stop: ## Остановить Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action stop

postgres-instance-down: ## Удалить контейнер Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action down

postgres-instance-clean: ## Удалить контейнер и образ Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action clean

postgres-instance-logs: ## Логи Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action logs

postgres-instance-shell: ## Shell Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_BIN) ./scripts/postgres-instances.mjs run --action shell

##@ pgAdmin
pgadmin-up: ## Запустить контейнер pgAdmin
	$(PGADMIN_COMPOSE) up -d

pgadmin-pull: ## Скачать/обновить образ pgAdmin
	$(PGADMIN_COMPOSE) pull

pgadmin-start: ## Запустить существующий контейнер pgAdmin
	$(PGADMIN_COMPOSE) start

pgadmin-stop: ## Остановить контейнер pgAdmin
	$(PGADMIN_COMPOSE) stop

pgadmin-down: ## Удалить контейнер pgAdmin
	$(PGADMIN_COMPOSE) down

pgadmin-clean: ## Удалить контейнер и образ pgAdmin
	$(PGADMIN_COMPOSE) down
	docker rmi dpage/pgadmin4:latest 2>/dev/null || true

pgadmin-logs: ## Логи pgAdmin
	$(PGADMIN_COMPOSE) logs -f

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

.PHONY: ui web-ui web-ui-up web-ui-build web-ui-start web-ui-stop web-ui-down web-ui-clean web-ui-logs
.PHONY: host-add host-remove app-proxy app-proxy-remove
.PHONY: generate-user ansible-build ansible-setup ansible-clean
.PHONY: npm-up npm-pull npm-start npm-stop npm-down npm-clean npm-logs
.PHONY: mariadb-shell mariadb-import mariadb-export mariadb-db-list mariadb-db-create mariadb-db-drop mariadb-dump-upload
.PHONY: phpmyadmin-up phpmyadmin-pull phpmyadmin-start phpmyadmin-stop phpmyadmin-down phpmyadmin-clean phpmyadmin-logs
.PHONY: mariadb-instance-add mariadb-instance-list mariadb-instance-generate mariadb-instance-up mariadb-instance-start mariadb-instance-stop mariadb-instance-down mariadb-instance-clean mariadb-instance-logs mariadb-instance-shell
.PHONY: phpmyadmin-config-generate phpmyadmin-reload
.PHONY: registry-up registry-pull registry-start registry-stop registry-down registry-clean registry-logs
.PHONY: registry-ui-up registry-ui-pull registry-ui-start registry-ui-stop registry-ui-down registry-ui-clean registry-ui-logs
.PHONY: minio-up minio-pull minio-start minio-stop minio-down minio-clean minio-logs
.PHONY: redis-up redis-pull redis-start redis-stop redis-down redis-clean redis-logs
.PHONY: redisinsight-up redisinsight-pull redisinsight-start redisinsight-stop redisinsight-down redisinsight-clean redisinsight-logs
.PHONY: postgres-up postgres-start postgres-stop postgres-down postgres-clean postgres-logs postgres-shell postgres-import postgres-export postgres-db-list postgres-db-create postgres-db-drop postgres-dump-upload
.PHONY: postgres-instance-add postgres-instance-list postgres-instance-up postgres-instance-start postgres-instance-stop postgres-instance-down postgres-instance-clean postgres-instance-logs postgres-instance-shell
.PHONY: pgadmin-up pgadmin-pull pgadmin-start pgadmin-stop pgadmin-down pgadmin-clean pgadmin-logs
.PHONY: rclone-install rclone-config rclone-test rclone-backup-s3
.PHONY: init proxy-network-ensure add-proxy delete-proxy
.PHONY: archive unarchive
.PHONY: push help
