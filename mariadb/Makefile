include .env
export

# Init
init:
	@echo "Создание сети mariadb-public"
	$(MAKE) mariadb-network
	@echo "Инициализация mariadb"
	$(MAKE) up

# DB
import-db:
#	docker exec -i mariadb-container mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME} < ${DUMP_PATH} # для импорта с хоста
	docker exec -i mariadb-container bash -c "mysql -uroot -p${MYSQL_ROOT_PASSWORD} ${DB_NAME} < ${DUMP_PATH}" # для импорта с контейнера


clear-db:
	docker exec mariadb sh -c "mysql -u root -p${MYSQL_ROOT_PASSWORD} -e 'DROP DATABASE IF EXISTS \`${DB_NAME}\`; CREATE DATABASE \`${DB_NAME}\`;'"

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
mariadb-network:
	docker network create mariadb-public || true

.PHONY: init up down start stop clean logs mariadb-network