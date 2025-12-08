# Docker Registry Management
init:
	@echo "🐳 Инициализация Docker Registry..."
	@mkdir -p data auth
	@if [ ! -f auth/htpasswd ]; then \
		echo ""; \
		echo "Создание пользователя 'admin' для Registry..."; \
		echo "Введите пароль для пользователя admin:"; \
		htpasswd -Bc auth/htpasswd admin; \
		echo ""; \
		echo "✅ Пользователь 'admin' создан"; \
	else \
		echo "✅ Пользователь 'admin' уже существует"; \
	fi
	@docker compose up -d

up:
	@docker compose up -d

down:
	@docker compose down

restart:
	@docker compose restart

logs:
	@docker compose logs -f

ps:
	@docker compose ps

# Добавить нового пользователя
add-user:
	@echo "Введите имя пользователя:"
	@read username && \
	echo "Введите пароль для пользователя $$username:" && \
	htpasswd -B auth/htpasswd $$username && \
	echo "✅ Пользователь $$username добавлен"
	@docker-compose restart

# Изменить пароль существующего пользователя
change-password:
	@echo "Введите имя пользователя:"
	@read username && \
	echo "Введите новый пароль для пользователя $$username:" && \
	htpasswd -Bc auth/htpasswd $$username && \
	echo "✅ Пароль для $$username изменен"
	@docker-compose restart

# Показать список пользователей
list-users:
	@echo "Пользователи Registry:"
	@cat auth/htpasswd | cut -d: -f1

# Удалить пользователя
remove-user:
	@echo "Введите имя пользователя для удаления:"
	@read username && \
	htpasswd -D auth/htpasswd $$username && \
	echo "✅ Пользователь $$username удален"
	@docker-compose restart

# Просмотр образов в Registry
list-images:
	@echo "Образы в Registry:"
	@curl -s http://localhost:5000/v2/_catalog | jq -r '.repositories[]' 2>/dev/null || \
	curl -s http://localhost:5000/v2/_catalog

# Просмотр тегов образа
list-tags:
	@echo "Введите имя образа (например: vs-cms-php-fpm):"
	@read image && \
	curl -s http://localhost:5000/v2/$$image/tags/list | jq '.' 2>/dev/null || \
	curl -s http://localhost:5000/v2/$$image/tags/list

# Проверка размера хранилища
storage-size:
	@echo "Размер хранилища Registry:"
	@du -sh data 2>/dev/null || echo "Папка data не найдена"

# Справка
help:
	@echo "Docker Registry - Доступные команды:"
	@echo ""
	@echo "Основные:"
	@echo "  make init              - Первая инициализация (создание пользователя admin)"
	@echo "  make up                - Запустить Registry"
	@echo "  make down              - Остановить Registry"
	@echo "  make restart           - Перезапустить Registry"
	@echo "  make logs              - Показать логи"
	@echo "  make ps                - Статус контейнера"
	@echo ""
	@echo "Управление пользователями:"
	@echo "  make add-user          - Добавить нового пользователя"
	@echo "  make change-password   - Изменить пароль пользователя"
	@echo "  make list-users        - Показать список пользователей"
	@echo "  make remove-user       - Удалить пользователя"
	@echo ""
	@echo "Управление образами:"
	@echo "  make list-images       - Показать список образов"
	@echo "  make list-tags         - Показать теги образа"
	@echo "  make storage-size      - Показать размер хранилища"

.PHONY: init up down restart logs ps add-user change-password list-users remove-user list-images list-tags cleanup storage-size clean help
