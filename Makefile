-include .env
export

COMPOSE_DIR := docker/compose
COMPOSE_ENV := $(if $(wildcard .env),--env-file .env,)
ROOT_DIR := $(CURDIR)
NODE_RUN := ./scripts/config/node-runtime.sh run
WEB_UI_IMAGE := infrastructure-ui
WEB_UI_RUNTIME_DIR := build/web-ui
WEB_UI_STATIC_DIR := $(WEB_UI_RUNTIME_DIR)/dist

compose-file = $(COMPOSE_DIR)/docker-compose-$(NAME).yml
compose = docker compose $(COMPOSE_ENV) -f $(call compose-file)

help: ## Показать список команд
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } \
		/^[a-zA-Z_-]+:.*?## / { printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2 }' \
		$(MAKEFILE_LIST)
	@echo ""

##@ Project
init: ## Создать settings.json из дефолтного шаблона
	@$(NODE_RUN) ./scripts/config/settings.mjs init
	@mkdir -p docker/mariadb docker/phpmyadmin docker/postgres dumps/mariadb dumps/postgres
	@[ -f docker/mariadb/instances.json ] || printf "[]\n" > docker/mariadb/instances.json
	@[ -f docker/postgres/instances.json ] || printf "[]\n" > docker/postgres/instances.json
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs generate

settings-show: ## Показать текущий settings.json
	@$(NODE_RUN) ./scripts/config/settings.mjs show

settings-set: ## Изменить settings.json, передать KEY=proxy.npmEmail VALUE=user@example.com
	@$(NODE_RUN) ./scripts/config/settings.mjs set

settings-env: ## Сгенерировать .env из config/settings.json
	@$(NODE_RUN) ./scripts/config/settings.mjs env

##@ Web UI
node-runtime: ## Скачать локальный Node.js runtime в .runtime/node
	@./scripts/config/node-runtime.sh ensure

ui: node-runtime web-ui-dist proxy-network-ensure ## Запустить Web UI на хосте
	@if docker ps --format '{{.Names}}' | grep -qx 'web-ui'; then \
		echo "Stopping legacy web-ui container..."; \
		docker stop web-ui >/dev/null; \
	fi
	@$(NODE_RUN) "$(WEB_UI_RUNTIME_DIR)/server.mjs"

web-ui-build: ## Собрать frontend dist через Docker
	docker build -t $(WEB_UI_IMAGE) -f web-ui/Dockerfile .
	@container="$$(docker create $(WEB_UI_IMAGE))"; \
		rm -rf "$(WEB_UI_RUNTIME_DIR)"; \
		mkdir -p "$(WEB_UI_RUNTIME_DIR)"; \
		docker cp "$$container:/opt/web-ui/dist" "$(WEB_UI_STATIC_DIR)"; \
		docker rm "$$container" >/dev/null; \
		cp web-ui/server.mjs "$(WEB_UI_RUNTIME_DIR)/server.mjs"; \
		cp web-ui/commands.manifest.json "$(WEB_UI_RUNTIME_DIR)/commands.manifest.json"; \
		cp -R web-ui/server "$(WEB_UI_RUNTIME_DIR)/server"; \
		cp -R web-ui/server-new "$(WEB_UI_RUNTIME_DIR)/server-new"

web-ui-dist: ## Создать build/web-ui, если его нет
	@if [ ! -f "$(WEB_UI_STATIC_DIR)/index.html" ] || [ ! -f "$(WEB_UI_RUNTIME_DIR)/server.mjs" ]; then \
		$(MAKE) web-ui-build; \
	fi

web-ui-clean: ## Удалить собранный frontend dist
	rm -rf "$(WEB_UI_RUNTIME_DIR)"

##@ Docker network
proxy-network-ensure: ## Создать общую сеть proxy, если ее еще нет
	@docker network inspect proxy >/dev/null 2>&1 || docker network create proxy

add-proxy: ## Создать общую сеть proxy
	docker network create proxy

delete-proxy: ## Удалить общую сеть proxy
	docker network rm proxy

##@ Docker compose
compose-up: ## Запустить compose service, передать NAME=npm
	$(call compose) up -d

compose-pull: ## Скачать/обновить compose image, передать NAME=npm
	$(call compose) pull

compose-start: ## Запустить существующий compose service, передать NAME=npm
	$(call compose) start

compose-stop: ## Остановить compose service, передать NAME=npm
	$(call compose) stop

compose-restart: ## Перезапустить compose service, передать NAME=npm
	$(call compose) restart

compose-down: ## Удалить compose service, передать NAME=npm
	$(call compose) down

compose-logs: ## Логи compose service, передать NAME=npm
	$(call compose) logs -f

compose-shell: ## Shell внутри compose service, передать NAME=npm
	@service="$$( $(call compose) config --services | head -n 1 )"; \
	$(call compose) exec $(COMPOSE_EXEC_FLAGS) "$$service" sh

##@ Hosts
host-add: ## Добавить локальный домен в /etc/hosts, передать DOMAIN=site.local
	@./scripts/nginx/hosts.sh add "$(DOMAIN)"

host-remove: ## Удалить локальный домен из /etc/hosts, передать DOMAIN=site.local
	@./scripts/nginx/hosts.sh remove "$(DOMAIN)"

##@ NPM proxy hosts
app-proxy: ## Создать/обновить Proxy Host в NPM, передать DOMAIN=site.local TARGET=container PORT=80, опционально SSL=1
	@$(NODE_RUN) ./scripts/nginx/npm-proxy.mjs \
			--domain "$(DOMAIN)" \
			--target "$(TARGET)" \
			--port "$(PORT)" \
			--scheme "http" \
			$(if $(SSL),--ssl "$(SSL)",)

app-proxy-remove: ## Удалить Proxy Host и SSL из NPM, передать DOMAIN=site.local
	@$(NODE_RUN) ./scripts/nginx/npm-proxy.mjs \
			--delete \
			--domain "$(DOMAIN)"

##@ Nginx Proxy Manager
npm-status: ## Показать статус NPM: container, running, uptime, url
	@COMPOSE_DIR="$(COMPOSE_DIR)" ./scripts/nginx/npm-status.sh

npm-up: ## Запустить контейнер NPM
	$(MAKE) compose-up NAME=npm

npm-pull: ## Скачать/обновить образ NPM
	$(MAKE) compose-pull NAME=npm

npm-start: ## Запустить существующий контейнер NPM
	$(MAKE) compose-start NAME=npm

npm-stop: ## Остановить контейнер NPM
	$(MAKE) compose-stop NAME=npm

npm-down: ## Удалить контейнер NPM
	$(MAKE) compose-down NAME=npm

npm-clean: ## Удалить контейнер и образ NPM
	$(MAKE) compose-down NAME=npm
	docker rmi jc21/nginx-proxy-manager:latest 2>/dev/null || true

npm-logs: ## Логи NPM
	$(MAKE) compose-logs NAME=npm

npm-shell: ## Shell внутри контейнера NPM
	$(MAKE) compose-shell NAME=npm

##@ MariaDB
mariadb-status: ## Показать статус MariaDB instances и phpMyAdmin
	@$(NODE_RUN) ./scripts/database/mariadb/status.mjs overview

mariadb-shell: ## Shell MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs run --action shell

mariadb-import: ## Импорт .sql/.sql.gz дампа, передать DATABASE=wp DUMP_FILE=dumps/mariadb/app.sql, опционально NAME=... или CONTAINER=...
	@$(NODE_RUN) ./scripts/database/mariadb/import.mjs

mariadb-export: ## Экспорт .sql/.sql.gz дампа, передать DATABASE=wp DUMP_FILE=dumps/mariadb/app.sql.gz, опционально NAME=... или CONTAINER=...
	@$(NODE_RUN) ./scripts/database/mariadb/export.mjs

mariadb-dump-list: ## Показать локальные MariaDB dump файлы
	@$(NODE_RUN) ./scripts/database/dumps.mjs list --engine mariadb

mariadb-db-list: ## Показать базы MariaDB, опционально NAME=... или CONTAINER=...
	@$(NODE_RUN) ./scripts/database/mariadb/databases.mjs list

mariadb-db-create: ## Создать базу MariaDB, передать DATABASE=app, опционально NAME=... или CONTAINER=...
	@$(NODE_RUN) ./scripts/database/mariadb/databases.mjs create --database "$(DATABASE)"

mariadb-db-drop: ## Удалить базу MariaDB, передать DATABASE=app, опционально NAME=... или CONTAINER=...
	@$(NODE_RUN) ./scripts/database/mariadb/databases.mjs drop --database "$(DATABASE)"

mariadb-dump-upload: ## Загрузить дамп на сервер, передать FILE=dumps/mariadb/app.sql TARGET_PATH=/remote/path/
	@file="$${FILE:-$${DUMP_FILE}}"; \
	if [ -z "$$file" ]; then echo "FILE or DUMP_FILE is required"; exit 1; fi; \
	if [ -z "$(TARGET_PATH)" ]; then echo "TARGET_PATH is required"; exit 1; fi; \
	scp "$$file" "$(SSH):$(TARGET_PATH)"

##@ MariaDB instances
mariadb-instance-add: ## Создать MariaDB instance, передать VERSION=11.4 DB_USER=admin PASSWORD=secret ROOT_PASSWORD=root-secret, опционально PORT=3307 AUTH_MODE=config|cookie
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs add \
		--version "$(VERSION)" \
		--user "$(DB_USER)" \
		--password "$(PASSWORD)" \
		--root-password "$(ROOT_PASSWORD)" \
		$(if $(PORT),--port "$(PORT)",) \
		$(if $(AUTH_MODE),--auth-mode "$(AUTH_MODE)",)

mariadb-instance-list: ## Показать MariaDB instances
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs list

mariadb-instance-resolve: ## Найти MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs resolve \
		$(if $(NAME),--name "$(NAME)",) \
		$(if $(CONTAINER),--container "$(CONTAINER)",)

mariadb-instance-status: ## Показать статус MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_RUN) ./scripts/database/mariadb/status.mjs instance \
		$(if $(NAME),--name "$(NAME)",) \
		$(if $(CONTAINER),--container "$(CONTAINER)",)

mariadb-instance-generate: ## Перегенерировать phpMyAdmin servers config
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs generate

mariadb-instance-up: ## Запустить MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs run --action up

mariadb-instance-start: ## Запустить существующий MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs run --action start

mariadb-instance-stop: ## Остановить MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs run --action stop

mariadb-instance-down: ## Удалить контейнер MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs run --action down

mariadb-instance-clean: ## Удалить контейнер и образ MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs run --action clean

mariadb-instance-logs: ## Логи MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs run --action logs

mariadb-instance-shell: ## Shell MariaDB instance, передать NAME=11-4 или CONTAINER=mariadb-11-4-container
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs run --action shell

##@ phpMyAdmin
phpmyadmin-status: ## Показать статус phpMyAdmin
	@$(NODE_RUN) ./scripts/database/mariadb/status.mjs phpmyadmin

phpmyadmin-up: ## Запустить контейнер phpMyAdmin
	$(MAKE) compose-up NAME=phpmyadmin

phpmyadmin-pull: ## Скачать/обновить образ phpMyAdmin
	$(MAKE) compose-pull NAME=phpmyadmin

phpmyadmin-start: ## Запустить существующий контейнер phpMyAdmin
	$(MAKE) compose-start NAME=phpmyadmin

phpmyadmin-stop: ## Остановить контейнер phpMyAdmin
	$(MAKE) compose-stop NAME=phpmyadmin

phpmyadmin-down: ## Удалить контейнер phpMyAdmin
	$(MAKE) compose-down NAME=phpmyadmin

phpmyadmin-clean: ## Удалить контейнер и образ phpMyAdmin
	$(MAKE) compose-down NAME=phpmyadmin
	docker rmi phpmyadmin/phpmyadmin 2>/dev/null || true

phpmyadmin-logs: ## Логи phpMyAdmin
	$(MAKE) compose-logs NAME=phpmyadmin

phpmyadmin-shell: ## Shell внутри контейнера phpMyAdmin
	$(MAKE) compose-shell NAME=phpmyadmin

phpmyadmin-config-generate: ## Перегенерировать список серверов phpMyAdmin
	@$(NODE_RUN) ./scripts/database/mariadb/instances.mjs generate

phpmyadmin-reload: ## Перезапустить phpMyAdmin после изменения списка серверов
	$(MAKE) compose-restart NAME=phpmyadmin

##@ Postgres
postgres-status: ## Показать статус Postgres instances и pgAdmin
	@$(NODE_RUN) ./scripts/database/postgres/status.mjs overview

postgres-up: ## Запустить Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action up

postgres-start: ## Запустить существующий Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action start

postgres-stop: ## Остановить Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action stop

postgres-down: ## Удалить контейнер Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action down

postgres-clean: ## Удалить контейнер и образ Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action clean

postgres-logs: ## Логи Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action logs

postgres-shell: ## Shell Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action shell

postgres-import: ## Импорт .sql/.sql.gz/.dump дампа, передать POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.sql, опционально NAME=... или CONTAINER=...
	@$(NODE_RUN) ./scripts/database/postgres/import.mjs

postgres-export: ## Экспорт .sql/.sql.gz/.dump дампа, передать POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.dump, опционально NAME=... или CONTAINER=...
	@$(NODE_RUN) ./scripts/database/postgres/export.mjs

postgres-dump-list: ## Показать локальные Postgres dump файлы
	@$(NODE_RUN) ./scripts/database/dumps.mjs list --engine postgres

postgres-db-list: ## Показать базы Postgres, опционально NAME=... или CONTAINER=...
	@$(NODE_RUN) ./scripts/database/postgres/databases.mjs list

postgres-db-create: ## Создать базу Postgres, передать DATABASE=app, опционально NAME=... или CONTAINER=...
	@$(NODE_RUN) ./scripts/database/postgres/databases.mjs create --database "$(DATABASE)"

postgres-db-drop: ## Удалить базу Postgres, передать DATABASE=app, опционально NAME=... или CONTAINER=...
	@$(NODE_RUN) ./scripts/database/postgres/databases.mjs drop --database "$(DATABASE)"

postgres-dump-upload: ## Загрузить Postgres dump на сервер, передать FILE=dumps/postgres/app.dump, опционально TARGET_PATH=/remote/path/
	@file="$${FILE:-$${DUMP_FILE:-$${POSTGRES_HOME_DUMP_PATH}$${POSTGRES_DUMP_NAME}}}"; \
	if [ -z "$$file" ]; then echo "FILE or DUMP_FILE is required"; exit 1; fi; \
	target_path="$${TARGET_PATH:-$${POSTGRES_SERVER_DUMP_PATH}}"; \
	if [ -z "$$target_path" ]; then echo "TARGET_PATH or POSTGRES_SERVER_DUMP_PATH is required"; exit 1; fi; \
	scp "$$file" "$(SSH):$$target_path"

##@ Postgres instances
postgres-instance-add: ## Создать Postgres instance, передать VERSION=17 DB_USER=admin PASSWORD=secret DATABASE=app
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs add \
		--version "$(VERSION)" \
		--user "$(DB_USER)" \
		--password "$(PASSWORD)" \
		--database "$(DATABASE)" \
		$(if $(PORT),--port "$(PORT)",)

postgres-instance-list: ## Показать Postgres instances
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs list

postgres-instance-resolve: ## Найти Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs resolve \
		$(if $(NAME),--name "$(NAME)",) \
		$(if $(CONTAINER),--container "$(CONTAINER)",)

postgres-instance-status: ## Показать статус Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/status.mjs instance \
		$(if $(NAME),--name "$(NAME)",) \
		$(if $(CONTAINER),--container "$(CONTAINER)",)

postgres-instance-up: ## Запустить Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action up

postgres-instance-start: ## Запустить существующий Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action start

postgres-instance-stop: ## Остановить Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action stop

postgres-instance-down: ## Удалить контейнер Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action down

postgres-instance-clean: ## Удалить контейнер и образ Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action clean

postgres-instance-logs: ## Логи Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action logs

postgres-instance-shell: ## Shell Postgres instance, передать NAME=17 или CONTAINER=postgres-17-container
	@$(NODE_RUN) ./scripts/database/postgres/instances.mjs run --action shell

##@ pgAdmin
pgadmin-status: ## Показать статус pgAdmin
	@$(NODE_RUN) ./scripts/database/postgres/status.mjs pgadmin

pgadmin-up: ## Запустить контейнер pgAdmin
	$(MAKE) compose-up NAME=pgadmin

pgadmin-pull: ## Скачать/обновить образ pgAdmin
	$(MAKE) compose-pull NAME=pgadmin

pgadmin-start: ## Запустить существующий контейнер pgAdmin
	$(MAKE) compose-start NAME=pgadmin

pgadmin-stop: ## Остановить контейнер pgAdmin
	$(MAKE) compose-stop NAME=pgadmin

pgadmin-down: ## Удалить контейнер pgAdmin
	$(MAKE) compose-down NAME=pgadmin

pgadmin-clean: ## Удалить контейнер и образ pgAdmin
	$(MAKE) compose-down NAME=pgadmin
	docker rmi dpage/pgadmin4:latest 2>/dev/null || true

pgadmin-logs: ## Логи pgAdmin
	$(MAKE) compose-logs NAME=pgadmin

pgadmin-shell: ## Shell внутри контейнера pgAdmin
	$(MAKE) compose-shell NAME=pgadmin

##@ Redis
redis-status: ## Показать статус Redis
	@$(NODE_RUN) ./scripts/redis/status.mjs redis

redis-up: ## Запустить контейнер Redis
	$(MAKE) compose-up NAME=redis

redis-pull: ## Скачать/обновить образ Redis
	$(MAKE) compose-pull NAME=redis

redis-start: ## Запустить существующий контейнер Redis
	$(MAKE) compose-start NAME=redis

redis-stop: ## Остановить контейнер Redis
	$(MAKE) compose-stop NAME=redis

redis-down: ## Удалить контейнер Redis
	$(MAKE) compose-down NAME=redis

redis-clean: ## Удалить контейнер и образ Redis
	$(MAKE) compose-down NAME=redis
	docker rmi redis:7-alpine 2>/dev/null || true

redis-logs: ## Логи Redis
	$(MAKE) compose-logs NAME=redis

redis-shell: ## Shell внутри контейнера Redis
	$(MAKE) compose-shell NAME=redis

##@ RedisInsight
redisinsight-status: ## Показать статус RedisInsight
	@$(NODE_RUN) ./scripts/redis/status.mjs redisinsight

redisinsight-up: ## Запустить контейнер RedisInsight
	$(MAKE) compose-up NAME=redisinsight

redisinsight-pull: ## Скачать/обновить образ RedisInsight
	$(MAKE) compose-pull NAME=redisinsight

redisinsight-start: ## Запустить существующий контейнер RedisInsight
	$(MAKE) compose-start NAME=redisinsight

redisinsight-stop: ## Остановить контейнер RedisInsight
	$(MAKE) compose-stop NAME=redisinsight

redisinsight-down: ## Удалить контейнер RedisInsight
	$(MAKE) compose-down NAME=redisinsight

redisinsight-clean: ## Удалить контейнер и образ RedisInsight
	$(MAKE) compose-down NAME=redisinsight
	docker rmi redis/redisinsight:latest 2>/dev/null || true

redisinsight-logs: ## Логи RedisInsight
	$(MAKE) compose-logs NAME=redisinsight

redisinsight-shell: ## Shell внутри контейнера RedisInsight
	$(MAKE) compose-shell NAME=redisinsight

##@ MinIO
minio-status: ## Показать статус MinIO
	@$(NODE_RUN) ./scripts/minio/status.mjs minio

minio-up: ## Запустить контейнер MinIO
	$(MAKE) compose-up NAME=minio

minio-pull: ## Скачать/обновить образ MinIO
	$(MAKE) compose-pull NAME=minio

minio-start: ## Запустить существующий контейнер MinIO
	$(MAKE) compose-start NAME=minio

minio-stop: ## Остановить контейнер MinIO
	$(MAKE) compose-stop NAME=minio

minio-down: ## Удалить контейнер MinIO
	$(MAKE) compose-down NAME=minio

minio-clean: ## Удалить контейнер и образ MinIO
	$(MAKE) compose-down NAME=minio
	docker rmi minio/minio 2>/dev/null || true

minio-logs: ## Логи MinIO
	$(MAKE) compose-logs NAME=minio

minio-shell: ## Shell внутри контейнера MinIO
	$(MAKE) compose-shell NAME=minio

##@ Registry
registry-status: ## Показать статус Registry
	@$(NODE_RUN) ./scripts/registry/status.mjs registry

registry-auth-generate: ## Создать htpasswd пользователя Registry из settings/.env
	@$(NODE_RUN) ./scripts/registry/auth.mjs

registry-up: registry-auth-generate ## Запустить контейнер Registry
	$(MAKE) compose-up NAME=registry

registry-pull: ## Скачать/обновить образ Registry
	$(MAKE) compose-pull NAME=registry

registry-start: ## Запустить существующий контейнер Registry
	$(MAKE) compose-start NAME=registry

registry-stop: ## Остановить контейнер Registry
	$(MAKE) compose-stop NAME=registry

registry-down: ## Удалить контейнер Registry
	$(MAKE) compose-down NAME=registry

registry-clean: ## Удалить контейнер и образ Registry
	$(MAKE) compose-down NAME=registry
	docker rmi registry:2 2>/dev/null || true

registry-logs: ## Логи Registry
	$(MAKE) compose-logs NAME=registry

registry-shell: ## Shell внутри контейнера Registry
	$(MAKE) compose-shell NAME=registry

##@ Registry UI
registry-ui-status: ## Показать статус Registry UI
	@$(NODE_RUN) ./scripts/registry/status.mjs registry-ui

registry-ui-up: ## Запустить контейнер Registry UI
	$(MAKE) compose-up NAME=registry-ui

registry-ui-pull: ## Скачать/обновить образ Registry UI
	$(MAKE) compose-pull NAME=registry-ui

registry-ui-start: ## Запустить существующий контейнер Registry UI
	$(MAKE) compose-start NAME=registry-ui

registry-ui-stop: ## Остановить контейнер Registry UI
	$(MAKE) compose-stop NAME=registry-ui

registry-ui-down: ## Удалить контейнер Registry UI
	$(MAKE) compose-down NAME=registry-ui

registry-ui-clean: ## Удалить контейнер и образ Registry UI
	$(MAKE) compose-down NAME=registry-ui
	docker rmi joxit/docker-registry-ui:latest 2>/dev/null || true

registry-ui-logs: ## Логи Registry UI
	$(MAKE) compose-logs NAME=registry-ui

registry-ui-shell: ## Shell внутри контейнера Registry UI
	$(MAKE) compose-shell NAME=registry-ui

.PHONY: help init settings-show settings-set settings-env
.PHONY: node-runtime ui web-ui-build web-ui-dist web-ui-clean
.PHONY: proxy-network-ensure add-proxy delete-proxy
.PHONY: compose-up compose-pull compose-start compose-stop compose-restart compose-down compose-logs compose-shell
.PHONY: host-add host-remove
.PHONY: app-proxy app-proxy-remove
.PHONY: npm-status npm-up npm-pull npm-start npm-stop npm-down npm-clean npm-logs npm-shell
.PHONY: mariadb-status mariadb-shell mariadb-import mariadb-export mariadb-dump-list mariadb-db-list mariadb-db-create mariadb-db-drop mariadb-dump-upload
.PHONY: mariadb-instance-add mariadb-instance-list mariadb-instance-resolve mariadb-instance-status mariadb-instance-generate mariadb-instance-up mariadb-instance-start mariadb-instance-stop mariadb-instance-down mariadb-instance-clean mariadb-instance-logs mariadb-instance-shell
.PHONY: phpmyadmin-status phpmyadmin-up phpmyadmin-pull phpmyadmin-start phpmyadmin-stop phpmyadmin-down phpmyadmin-clean phpmyadmin-logs phpmyadmin-shell phpmyadmin-config-generate phpmyadmin-reload
.PHONY: postgres-status postgres-up postgres-start postgres-stop postgres-down postgres-clean postgres-logs postgres-shell postgres-import postgres-export postgres-dump-list postgres-db-list postgres-db-create postgres-db-drop postgres-dump-upload
.PHONY: postgres-instance-add postgres-instance-list postgres-instance-resolve postgres-instance-status postgres-instance-up postgres-instance-start postgres-instance-stop postgres-instance-down postgres-instance-clean postgres-instance-logs postgres-instance-shell
.PHONY: pgadmin-status pgadmin-up pgadmin-pull pgadmin-start pgadmin-stop pgadmin-down pgadmin-clean pgadmin-logs pgadmin-shell
.PHONY: redis-status redis-up redis-pull redis-start redis-stop redis-down redis-clean redis-logs redis-shell
.PHONY: redisinsight-status redisinsight-up redisinsight-pull redisinsight-start redisinsight-stop redisinsight-down redisinsight-clean redisinsight-logs redisinsight-shell
.PHONY: minio-status minio-up minio-pull minio-start minio-stop minio-down minio-clean minio-logs minio-shell
.PHONY: registry-status registry-auth-generate registry-up registry-pull registry-start registry-stop registry-down registry-clean registry-logs registry-shell
.PHONY: registry-ui-status registry-ui-up registry-ui-pull registry-ui-start registry-ui-stop registry-ui-down registry-ui-clean registry-ui-logs registry-ui-shell
