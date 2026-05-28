-include .env
export

COMPOSE_DIR := docker/compose
COMPOSE_ENV := $(if $(wildcard .env),--env-file .env,)
NODE := docker run --rm -v "$(PWD):/app" -w /app
NODE_IMAGE := node:24-bookworm

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
	$(call compose) exec "$$service" sh

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
.PHONY: proxy-network-ensure add-proxy delete-proxy
.PHONY: compose-up compose-pull compose-start compose-stop compose-down compose-logs compose-shell
.PHONY: host-add host-remove
.PHONY: app-proxy app-proxy-remove
.PHONY: npm-status npm-up npm-pull npm-start npm-stop npm-down npm-clean npm-logs npm-shell
