COMPOSER = docker run --rm -it -v $(PWD):/app -w /app composer:latest

.PHONY: help composer-install composer-update composer-require composer-dump composer-validate

help: ## Показать список команд
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} \
	   /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } \
	   /^[a-zA-Z_-]+:.*?## / { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' \
	   $(MAKEFILE_LIST)
	@echo ""

##@ Composer
composer-install: ## Установить зависимости
	$(COMPOSER) composer install

composer-update: ## Обновить зависимости
	$(COMPOSER) composer update

composer-dump: ## Обновить автозагрузку
	$(COMPOSER) composer dump-autoload

composer-validate: ## Проверить composer.json
	$(COMPOSER) composer validate

composer-require: ## Добавить пакет: make composer-require PKG="vendor/package"
	$(COMPOSER) composer require $(PKG)

composer-remove: ## Удалить пакет: make composer-remove PKG="vendor/package"
	$(COMPOSER) composer remove $(PKG)