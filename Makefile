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

settings-show: ## Показать текущий settings.json
	@$(NODE_RUN) ./scripts/config/settings.mjs show

settings-set: ## Изменить settings.json, передать KEY=proxy.npmEmail VALUE=user@example.com
	@$(NODE_RUN) ./scripts/config/settings.mjs set

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

.PHONY: help init settings-show settings-set
.PHONY: node-runtime ui web-ui-build web-ui-dist web-ui-clean
.PHONY: proxy-network-ensure add-proxy delete-proxy
.PHONY: compose-up compose-pull compose-start compose-stop compose-down compose-logs compose-shell
.PHONY: host-add host-remove
.PHONY: app-proxy app-proxy-remove
.PHONY: npm-status npm-up npm-pull npm-start npm-stop npm-down npm-clean npm-logs npm-shell
