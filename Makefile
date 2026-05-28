-include .env
export

COMPOSE_DIR := docker/compose
COMPOSE_ENV := $(if $(wildcard .env),--env-file .env,)
ROOT_DIR := $(CURDIR)
NODE := docker run --rm -v "$(ROOT_DIR):/app" -w /app
NODE_IMAGE := node:24-bookworm
HOST_BRIDGE_HOST ?= 0.0.0.0
HOST_BRIDGE_PORT ?= 8099
HOST_BRIDGE_URL ?= http://host.docker.internal:$(HOST_BRIDGE_PORT)
HOST_BRIDGE_PID := .tmp/host-bridge.pid
HOST_BRIDGE_LOG := .tmp/host-bridge.log
WEB_UI_COMPOSE := PWD="$(ROOT_DIR)" HOST_BRIDGE_URL="$(HOST_BRIDGE_URL)" docker compose $(COMPOSE_ENV) -f $(COMPOSE_DIR)/docker-compose-web-ui.yml

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
	@$(NODE) \
		-e INFRA_SETTINGS_FILE \
		-e INFRA_DEFAULT_SETTINGS_FILE \
		$(NODE_IMAGE) node ./scripts/config/settings.mjs init

settings-show: ## Показать текущий settings.json
	@$(NODE) \
		-e INFRA_SETTINGS_FILE \
		-e INFRA_DEFAULT_SETTINGS_FILE \
		$(NODE_IMAGE) node ./scripts/config/settings.mjs show

settings-set: ## Изменить settings.json, передать KEY=proxy.npmEmail VALUE=user@example.com
	@$(NODE) \
		-e INFRA_SETTINGS_FILE \
		-e INFRA_DEFAULT_SETTINGS_FILE \
		-e KEY \
		-e VALUE \
		$(NODE_IMAGE) node ./scripts/config/settings.mjs set

##@ Web UI
ui-bridge: ## Запустить host bridge для выполнения make-команд на хосте
	@HOST_BRIDGE_HOST="$(HOST_BRIDGE_HOST)" HOST_BRIDGE_PORT="$(HOST_BRIDGE_PORT)" node ./web-ui/server-new/host-bridge.mjs

ui-bridge-start: ## Запустить host bridge в фоне
	@mkdir -p .tmp
	@if [ -f "$(HOST_BRIDGE_PID)" ] && kill -0 "$$(cat "$(HOST_BRIDGE_PID)")" 2>/dev/null; then \
		echo "Host bridge already running: $$(cat "$(HOST_BRIDGE_PID)")"; \
	else \
		HOST_BRIDGE_HOST="$(HOST_BRIDGE_HOST)" HOST_BRIDGE_PORT="$(HOST_BRIDGE_PORT)" \
			nohup node ./web-ui/server-new/host-bridge.mjs > "$(HOST_BRIDGE_LOG)" 2>&1 & \
		echo "$$!" > "$(HOST_BRIDGE_PID)"; \
		echo "Host bridge started: $$(cat "$(HOST_BRIDGE_PID)")"; \
		echo "Logs: $(HOST_BRIDGE_LOG)"; \
	fi

ui-bridge-stop: ## Остановить host bridge
	@if [ -f "$(HOST_BRIDGE_PID)" ] && kill -0 "$$(cat "$(HOST_BRIDGE_PID)")" 2>/dev/null; then \
		kill "$$(cat "$(HOST_BRIDGE_PID)")"; \
		rm -f "$(HOST_BRIDGE_PID)"; \
		echo "Host bridge stopped"; \
	else \
		rm -f "$(HOST_BRIDGE_PID)"; \
		echo "Host bridge is not running"; \
	fi

ui: ui-bridge-start web-ui-up ## Запустить host bridge и Web UI контейнер

web-ui-up: proxy-network-ensure ## Собрать и запустить Web UI
	$(WEB_UI_COMPOSE) up -d --build

web-ui-down: ## Удалить Web UI контейнер
	$(WEB_UI_COMPOSE) down

web-ui-logs: ## Показать логи Web UI
	$(WEB_UI_COMPOSE) logs -f web-ui

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
	@$(NODE) \
		$(NODE_IMAGE) node ./scripts/nginx/npm-proxy.mjs \
			--domain "$(DOMAIN)" \
			--target "$(TARGET)" \
			--port "$(PORT)" \
			--scheme "http" \
			$(if $(SSL),--ssl "$(SSL)",)

app-proxy-remove: ## Удалить Proxy Host и SSL из NPM, передать DOMAIN=site.local
	@$(NODE) \
		$(NODE_IMAGE) node ./scripts/nginx/npm-proxy.mjs \
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

.PHONY: help init settings-show settings-set
.PHONY: ui-bridge ui-bridge-start ui-bridge-stop ui
.PHONY: web-ui-up web-ui-down web-ui-logs
.PHONY: proxy-network-ensure add-proxy delete-proxy
.PHONY: compose-up compose-pull compose-start compose-stop compose-down compose-logs compose-shell
.PHONY: host-add host-remove
.PHONY: app-proxy app-proxy-remove
.PHONY: npm-status npm-up npm-pull npm-start npm-stop npm-down npm-clean npm-logs npm-shell
