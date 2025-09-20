# Init
init:
	@echo "Создание сети proxy"
	$(MAKE) nginx-network
	@echo "Инициализация nginx"
	$(MAKE) up
	@echo ""
	@echo "✅ Nginx Proxy Manager запущен!"
	@printf "\033]8;;http://localhost:81\007🌐 Панель управления\033]8;;\007\n"
	@echo "👤 Логин: admin@example.com"
	@echo "🔑 Пароль: changeme"

# Docker
up:
	docker compose -f docker-compose.yml up -d --build

down:
	docker compose -f docker-compose.yml down --remove-orphans

start:
	docker compose -f docker-compose.yml start

stop:
	docker compose -f docker-compose.yml stop

clean:
	docker compose -f docker-compose.yml down -v

logs:
	docker compose -f docker-compose.yml logs -f

# Network
nginx-network:
	docker network create proxy || true

.PHONY: init up down start stop clean logs nginx-network
