NODE = docker run --rm -it -v $(PWD):/app -w /app node:20

.PHONY: help npm-install npm-build npm-dev npm-lint npm-clean

help: ## Показать список команд
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } \
		/^[a-zA-Z_-]+:.*?## / { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' \
		$(MAKEFILE_LIST)
	@echo ""

##@ Node
npm-install: ## Установить зависимости
	$(NODE) npm install

npm-build: ## Собрать проект (production)
	$(NODE) npm run build

npm-dev: ## Запустить watch режим
	$(NODE) npm run dev

npm-lint: ## Проверить код
	$(NODE) npm run lint

npm-clean: ## Удалить node_modules
	rm -rf node_modules