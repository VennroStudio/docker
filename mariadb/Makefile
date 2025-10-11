include .env
export

# Init
init:
	$(MAKE) mariadb-network
	$(MAKE) up

# DB
# Для импорта с хоста
import-db-h:
	docker exec -i mariadb-container mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME} < ${DUMP_PATH}

import-db-h-gz:
	cat ${DUMP_PATH} | gunzip -c | docker exec -i mariadb-container mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME}

# Для импорта с контейнера
import-db-c:
	docker exec -i mariadb-container bash -c "mysql -uroot -p${MYSQL_ROOT_PASSWORD} ${DB_NAME} < ${DUMP_PATH}"

clear-db:
	docker exec mariadb-container sh -c "mysql -u root -p${MYSQL_ROOT_PASSWORD} -e 'DROP DATABASE IF EXISTS \`${DB_NAME}\`; CREATE DATABASE \`${DB_NAME}\`;'"

export-db:
	docker exec mariadb-container mysqldump -h${HOST_IP} -P${HOST_PORT} -u${HOST_USER} -p${HOST_PASS} ${HOST_DB} --result-file=${DUMP_PATH}

go-root:
	scp ${HOME_PATH} ${SSH}:${DUMP_PATH}

# Docker
up:
	docker compose -f docker-compose.yml up -d --build

down:
	docker compose -f docker-compose.yml down

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