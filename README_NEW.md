# Infrastructure by Vennro Studio

## Первый запуск

Создать локальные config-файлы:

```sh
make init
```

Команда не запускает контейнеры. Если `config/settings.json` или `config/ssh-servers.json` уже существуют, файлы не перезаписываются.

Проверить настройки:

```sh
make settings-show
```

Изменить настройки Nginx Proxy Manager:

```sh
make settings-set KEY=proxy.npmEmail VALUE=user@example.com
make settings-set KEY=proxy.npmPassword VALUE=secret
```

Изменить настройки pgAdmin:

```sh
make settings-set KEY=pgadmin.pgaEmail VALUE=admin@example.com
make settings-set KEY=pgadmin.pgaPassword VALUE=secret
```

Изменить пароль Redis:

```sh
make settings-set KEY=redis.redisPassword VALUE=secret
```

Изменить настройки MinIO:

```sh
make settings-set KEY=minio.minioRootUser VALUE=minio
make settings-set KEY=minio.minioRootPassword VALUE=secret
```

Изменить настройки Registry:

```sh
make settings-set KEY=registry.registryUser VALUE=admin
make settings-set KEY=registry.registryPassword VALUE=secret
```

Сгенерировать `.env` для compose-файлов, которым нужны переменные окружения:

```sh
make settings-env
```

## Рабочий флоу

### Пример: запуск Nginx Proxy Manager

Создать общую Docker network:

```sh
make proxy-network-ensure
```

Запустить NPM:

```sh
make npm-up
```

Проверить статус:

```sh
make npm-status
```

Пример ответа:

```json
{
  "container": "nginx-container",
  "running": true,
  "state": "running",
  "uptime": "Up 3 days",
  "url": "http://localhost:81"
}
```

Открыть URL из `npm-status`, зарегистрироваться или изменить логин/пароль в NPM, затем записать их в settings:

```sh
make settings-set KEY=proxy.npmEmail VALUE=user@example.com
make settings-set KEY=proxy.npmPassword VALUE=secret
```

### Локальный домен для NPM

Добавить домен в hosts:

```sh
make host-add DOMAIN=npm.local
```

Создать proxy host для самого NPM:

```sh
make app-proxy DOMAIN=npm.local TARGET=nginx-container PORT=81
```

Создать proxy host с SSL:

```sh
make app-proxy DOMAIN=npm.local TARGET=nginx-container PORT=81 SSL=1
```

Когда `TARGET=nginx-container`, скрипт обновляет `config/settings.json`:

```json
{
  "proxy": {
    "npmUrl": "http://npm.local"
  }
}
```

С `SSL=1` значение будет `https://npm.local`.

Проверить актуальный URL:

```sh
make npm-status
```

Удалить proxy host для NPM:

```sh
make app-proxy-remove DOMAIN=npm.local
```

Если удаляемый домен был привязан к `nginx-container`, скрипт вернет:

```json
{
  "proxy": {
    "npmUrl": "http://localhost:81"
  }
}
```

Удалить домен из hosts:

```sh
make host-remove DOMAIN=npm.local
```

Проверить итоговый статус:

```sh
make npm-status
```

### Пример: MariaDB и phpMyAdmin

Создать MariaDB instance:

```sh
make mariadb-instance-add VERSION=11.4 DB_USER=admin PASSWORD=secret ROOT_PASSWORD=root-secret
```

Показать список MariaDB instances:

```sh
make mariadb-instance-list
```

Проверить конкретный MariaDB instance:

```sh
make mariadb-instance-resolve NAME=11-4
make mariadb-instance-status NAME=11-4
```

Запустить MariaDB instance:

```sh
make mariadb-instance-up NAME=11-4
```

Запустить phpMyAdmin:

```sh
make phpmyadmin-up
```

Проверить статус MariaDB instances и phpMyAdmin. URL phpMyAdmin возвращается в этом же ответе:

```sh
make mariadb-status
```

Если нужен локальный домен для phpMyAdmin:

```sh
make host-add DOMAIN=pma.local
make app-proxy DOMAIN=pma.local TARGET=phpmyadmin-container PORT=80
```

Показать базы данных:

```sh
make mariadb-db-list NAME=11-4
```

Показать локальные dump файлы:

```sh
make mariadb-dump-list
```

Создать базу данных:

```sh
make mariadb-db-create NAME=11-4 DATABASE=app
```

Импортировать dump:

```sh
make mariadb-import NAME=11-4 DATABASE=app DUMP_FILE=dumps/mariadb/app.sql
```

Экспортировать dump:

```sh
make mariadb-export NAME=11-4 DATABASE=app DUMP_FILE=dumps/mariadb/app.sql.gz
```

Остановить MariaDB instance:

```sh
make mariadb-instance-stop NAME=11-4
```

Удалить контейнер MariaDB instance:

```sh
make mariadb-instance-down NAME=11-4
```

### Пример: Postgres и pgAdmin

Создать Postgres instance:

```sh
make postgres-instance-add VERSION=17 DB_USER=admin PASSWORD=secret DATABASE=app
```

Показать список Postgres instances:

```sh
make postgres-instance-list
```

Проверить конкретный Postgres instance:

```sh
make postgres-instance-resolve NAME=17
make postgres-instance-status NAME=17
```

Запустить Postgres instance:

```sh
make postgres-instance-up NAME=17
```

Запустить pgAdmin:

```sh
make pgadmin-up
```

Проверить статус Postgres instances и pgAdmin. URL pgAdmin возвращается в этом же ответе:

```sh
make postgres-status
```

Если нужен локальный домен для pgAdmin:

```sh
make host-add DOMAIN=pgadmin.local
make app-proxy DOMAIN=pgadmin.local TARGET=pgadmin-container PORT=80
```

Показать базы данных:

```sh
make postgres-db-list NAME=17
```

Показать локальные dump файлы:

```sh
make postgres-dump-list
```

Создать базу данных:

```sh
make postgres-db-create NAME=17 DATABASE=app_test
```

Импортировать dump:

```sh
make postgres-import NAME=17 POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.sql
```

Экспортировать dump:

```sh
make postgres-export NAME=17 POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.dump
```

Остановить Postgres instance:

```sh
make postgres-instance-stop NAME=17
```

Удалить контейнер Postgres instance:

```sh
make postgres-instance-down NAME=17
```

### Пример: Redis и RedisInsight

Задать пароль Redis в settings:

```sh
make settings-set KEY=redis.redisPassword VALUE=secret
```

Сгенерировать `.env`:

```sh
make settings-env
```

Запустить Redis:

```sh
make redis-up
```

Проверить статус Redis:

```sh
make redis-status
```

Запустить RedisInsight:

```sh
make redisinsight-up
```

Проверить статус RedisInsight. URL RedisInsight возвращается в этом же ответе:

```sh
make redisinsight-status
```

Если нужен локальный домен для RedisInsight:

```sh
make host-add DOMAIN=redis.local
make app-proxy DOMAIN=redis.local TARGET=redisinsight-container PORT=5540
```

После создания proxy host скрипт обновит `config/settings.json`:

```json
{
  "redisinsight": {
    "riUrl": "http://redis.local"
  }
}
```

При удалении proxy host значение вернется на `http://localhost:5540`:

```sh
make app-proxy-remove DOMAIN=redis.local
```

Остановить Redis и RedisInsight:

```sh
make redis-stop
make redisinsight-stop
```

### Пример: MinIO

Задать логин и пароль MinIO в settings:

```sh
make settings-set KEY=minio.minioRootUser VALUE=minio
make settings-set KEY=minio.minioRootPassword VALUE=secret
```

Сгенерировать `.env`:

```sh
make settings-env
```

Запустить MinIO:

```sh
make minio-up
```

Проверить статус MinIO. URL консоли возвращается в этом же ответе:

```sh
make minio-status
```

Если нужен локальный домен для MinIO console:

```sh
make host-add DOMAIN=minio.local
make app-proxy DOMAIN=minio.local TARGET=minio-container PORT=9001
```

После создания proxy host скрипт обновит `config/settings.json`:

```json
{
  "minio": {
    "minioUrl": "http://minio.local"
  }
}
```

При удалении proxy host значение вернется на `http://localhost:3901`:

```sh
make app-proxy-remove DOMAIN=minio.local
```

### Пример: Registry и Registry UI

Задать логин и пароль Registry в settings:

```sh
make settings-set KEY=registry.registryUser VALUE=admin
make settings-set KEY=registry.registryPassword VALUE=secret
```

Сгенерировать `.env` и htpasswd:

```sh
make settings-env
make registry-auth-generate
```

Запустить Registry и Registry UI:

```sh
make registry-up
make registry-ui-up
```

Проверить статусы. URL возвращается в каждом status-ответе:

```sh
make registry-status
make registry-ui-status
```

Если нужен локальный домен для Registry UI:

```sh
make host-add DOMAIN=registry.local
make app-proxy DOMAIN=registry.local TARGET=registry-ui-container PORT=80
```

После создания proxy host скрипт обновит `config/settings.json`:

```json
{
  "registry": {
    "registryUiUrl": "http://registry.local"
  }
}
```

При удалении proxy host значение вернется на `http://localhost:5081`:

```sh
make app-proxy-remove DOMAIN=registry.local
```

## Сводка команд

### Project

Показать все команды:

```sh
make help
```

Создать локальные config-файлы:

```sh
make init
```

Показать текущий `config/settings.json`:

```sh
make settings-show
```

Изменить значение в `config/settings.json`:

```sh
make settings-set KEY=proxy.npmEmail VALUE=user@example.com
```

Сгенерировать `.env` из `config/settings.json`:

```sh
make settings-env
```

### Docker Network

Создать общую Docker network `proxy`, если ее еще нет:

```sh
make proxy-network-ensure
```

Создать общую Docker network `proxy`:

```sh
make add-proxy
```

Удалить общую Docker network `proxy`:

```sh
make delete-proxy
```

### Nginx Proxy Manager

Добавить локальный домен в hosts:

```sh
make host-add DOMAIN=npm.local
```

Удалить локальный домен из hosts:

```sh
make host-remove DOMAIN=npm.local
```

Создать или обновить Proxy Host в NPM:

```sh
make app-proxy DOMAIN=npm.local TARGET=nginx-container PORT=81
```

Создать или обновить Proxy Host в NPM с SSL:

```sh
make app-proxy DOMAIN=npm.local TARGET=nginx-container PORT=81 SSL=1
```

Удалить Proxy Host и SSL из NPM:

```sh
make app-proxy-remove DOMAIN=npm.local
```

Показать статус NPM:

```sh
make npm-status
```

Скачать или обновить Docker image NPM:

```sh
make npm-pull
```

Создать и запустить контейнер NPM через `docker-compose-npm.yml`:

```sh
make npm-up
```

Запустить уже созданный контейнер NPM:

```sh
make npm-start
```

Остановить контейнер NPM:

```sh
make npm-stop
```

Удалить контейнер NPM, но не удалять image:

```sh
make npm-down
```

Удалить контейнер NPM и Docker image `jc21/nginx-proxy-manager:latest`:

```sh
make npm-clean
```

Показать логи NPM:

```sh
make npm-logs
```

Зайти в shell контейнера NPM:

```sh
make npm-shell
```

### MariaDB

Показать статус MariaDB instances и phpMyAdmin:

```sh
make mariadb-status
```

Зайти в shell MariaDB instance:

```sh
make mariadb-shell NAME=11-4
```

Импортировать `.sql` или `.sql.gz` dump:

```sh
make mariadb-import NAME=11-4 DATABASE=app DUMP_FILE=dumps/mariadb/app.sql
```

Экспортировать `.sql` или `.sql.gz` dump:

```sh
make mariadb-export NAME=11-4 DATABASE=app DUMP_FILE=dumps/mariadb/app.sql.gz
```

Показать локальные MariaDB dump файлы:

```sh
make mariadb-dump-list
```

Показать список баз данных:

```sh
make mariadb-db-list NAME=11-4
```

Создать базу данных:

```sh
make mariadb-db-create NAME=11-4 DATABASE=app
```

Удалить базу данных:

```sh
make mariadb-db-drop NAME=11-4 DATABASE=app
```

Загрузить dump на сервер:

```sh
make mariadb-dump-upload FILE=dumps/mariadb/app.sql TARGET_PATH=/remote/path/
```

### MariaDB Instances

Создать MariaDB instance:

```sh
make mariadb-instance-add VERSION=11.4 DB_USER=admin PASSWORD=secret ROOT_PASSWORD=root-secret
```

Создать MariaDB instance с портом и режимом авторизации phpMyAdmin:

```sh
make mariadb-instance-add VERSION=11.4 DB_USER=admin PASSWORD=secret ROOT_PASSWORD=root-secret PORT=3308 AUTH_MODE=config
```

Показать MariaDB instances:

```sh
make mariadb-instance-list
```

Найти MariaDB instance по имени или контейнеру:

```sh
make mariadb-instance-resolve NAME=11-4
make mariadb-instance-resolve CONTAINER=mariadb-11-4-container
```

Показать статус MariaDB instance:

```sh
make mariadb-instance-status NAME=11-4
```

Перегенерировать `docker/phpmyadmin/config.inc.php`:

```sh
make mariadb-instance-generate
```

Запустить MariaDB instance:

```sh
make mariadb-instance-up NAME=11-4
```

Запустить уже созданный MariaDB instance:

```sh
make mariadb-instance-start NAME=11-4
```

Остановить MariaDB instance:

```sh
make mariadb-instance-stop NAME=11-4
```

Удалить контейнер MariaDB instance:

```sh
make mariadb-instance-down NAME=11-4
```

Удалить контейнер MariaDB instance и Docker image:

```sh
make mariadb-instance-clean NAME=11-4
```

Показать логи MariaDB instance:

```sh
make mariadb-instance-logs NAME=11-4
```

Зайти в shell MariaDB instance:

```sh
make mariadb-instance-shell NAME=11-4
```

### phpMyAdmin

Показать статус phpMyAdmin и URL:

```sh
make phpmyadmin-status
```

Скачать или обновить Docker image phpMyAdmin:

```sh
make phpmyadmin-pull
```

Создать и запустить контейнер phpMyAdmin:

```sh
make phpmyadmin-up
```

Запустить уже созданный контейнер phpMyAdmin:

```sh
make phpmyadmin-start
```

Остановить контейнер phpMyAdmin:

```sh
make phpmyadmin-stop
```

Удалить контейнер phpMyAdmin:

```sh
make phpmyadmin-down
```

Удалить контейнер phpMyAdmin и Docker image:

```sh
make phpmyadmin-clean
```

Показать логи phpMyAdmin:

```sh
make phpmyadmin-logs
```

Зайти в shell контейнера phpMyAdmin:

```sh
make phpmyadmin-shell
```

Перегенерировать список серверов phpMyAdmin:

```sh
make phpmyadmin-config-generate
```

Перезапустить phpMyAdmin после изменения списка серверов:

```sh
make phpmyadmin-reload
```

### Postgres

Показать статус Postgres instances и pgAdmin:

```sh
make postgres-status
```

Запустить Postgres instance:

```sh
make postgres-up NAME=17
```

Запустить уже созданный Postgres instance:

```sh
make postgres-start NAME=17
```

Остановить Postgres instance:

```sh
make postgres-stop NAME=17
```

Удалить контейнер Postgres instance:

```sh
make postgres-down NAME=17
```

Удалить контейнер Postgres instance и Docker image:

```sh
make postgres-clean NAME=17
```

Показать логи Postgres instance:

```sh
make postgres-logs NAME=17
```

Зайти в shell Postgres instance:

```sh
make postgres-shell NAME=17
```

Импортировать `.sql`, `.sql.gz` или `.dump`:

```sh
make postgres-import NAME=17 POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.sql
```

Экспортировать `.sql`, `.sql.gz` или `.dump`:

```sh
make postgres-export NAME=17 POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.dump
```

Показать локальные Postgres dump файлы:

```sh
make postgres-dump-list
```

Показать список баз данных:

```sh
make postgres-db-list NAME=17
```

Создать базу данных:

```sh
make postgres-db-create NAME=17 DATABASE=app_test
```

Удалить базу данных:

```sh
make postgres-db-drop NAME=17 DATABASE=app_test
```

Загрузить dump на сервер:

```sh
make postgres-dump-upload FILE=dumps/postgres/app.dump TARGET_PATH=/remote/path/
```

### Postgres Instances

Создать Postgres instance:

```sh
make postgres-instance-add VERSION=17 DB_USER=admin PASSWORD=secret DATABASE=app
```

Создать Postgres instance с портом:

```sh
make postgres-instance-add VERSION=17 DB_USER=admin PASSWORD=secret DATABASE=app PORT=5433
```

Показать Postgres instances:

```sh
make postgres-instance-list
```

Найти Postgres instance по имени или контейнеру:

```sh
make postgres-instance-resolve NAME=17
make postgres-instance-resolve CONTAINER=postgres-17-container
```

Показать статус Postgres instance:

```sh
make postgres-instance-status NAME=17
```

Запустить Postgres instance:

```sh
make postgres-instance-up NAME=17
```

Запустить уже созданный Postgres instance:

```sh
make postgres-instance-start NAME=17
```

Остановить Postgres instance:

```sh
make postgres-instance-stop NAME=17
```

Удалить контейнер Postgres instance:

```sh
make postgres-instance-down NAME=17
```

Удалить контейнер Postgres instance и Docker image:

```sh
make postgres-instance-clean NAME=17
```

Показать логи Postgres instance:

```sh
make postgres-instance-logs NAME=17
```

Зайти в shell Postgres instance:

```sh
make postgres-instance-shell NAME=17
```

### pgAdmin

Показать статус pgAdmin и URL:

```sh
make pgadmin-status
```

Скачать или обновить Docker image pgAdmin:

```sh
make pgadmin-pull
```

Создать и запустить контейнер pgAdmin:

```sh
make pgadmin-up
```

Запустить уже созданный контейнер pgAdmin:

```sh
make pgadmin-start
```

Остановить контейнер pgAdmin:

```sh
make pgadmin-stop
```

Удалить контейнер pgAdmin:

```sh
make pgadmin-down
```

Удалить контейнер pgAdmin и Docker image:

```sh
make pgadmin-clean
```

Показать логи pgAdmin:

```sh
make pgadmin-logs
```

Зайти в shell контейнера pgAdmin:

```sh
make pgadmin-shell
```

### Redis

Показать статус Redis:

```sh
make redis-status
```

Скачать или обновить Docker image Redis:

```sh
make redis-pull
```

Создать и запустить контейнер Redis:

```sh
make redis-up
```

Запустить уже созданный контейнер Redis:

```sh
make redis-start
```

Остановить контейнер Redis:

```sh
make redis-stop
```

Удалить контейнер Redis:

```sh
make redis-down
```

Удалить контейнер Redis и Docker image `redis:7-alpine`:

```sh
make redis-clean
```

Показать логи Redis:

```sh
make redis-logs
```

Зайти в shell контейнера Redis:

```sh
make redis-shell
```

### RedisInsight

Показать статус RedisInsight и URL:

```sh
make redisinsight-status
```

Скачать или обновить Docker image RedisInsight:

```sh
make redisinsight-pull
```

Создать и запустить контейнер RedisInsight:

```sh
make redisinsight-up
```

Запустить уже созданный контейнер RedisInsight:

```sh
make redisinsight-start
```

Остановить контейнер RedisInsight:

```sh
make redisinsight-stop
```

Удалить контейнер RedisInsight:

```sh
make redisinsight-down
```

Удалить контейнер RedisInsight и Docker image `redis/redisinsight:latest`:

```sh
make redisinsight-clean
```

Показать логи RedisInsight:

```sh
make redisinsight-logs
```

Зайти в shell контейнера RedisInsight:

```sh
make redisinsight-shell
```

### MinIO

Показать статус MinIO и URL консоли:

```sh
make minio-status
```

Скачать или обновить Docker image MinIO:

```sh
make minio-pull
```

Создать и запустить контейнер MinIO:

```sh
make minio-up
```

Запустить уже созданный контейнер MinIO:

```sh
make minio-start
```

Остановить контейнер MinIO:

```sh
make minio-stop
```

Удалить контейнер MinIO:

```sh
make minio-down
```

Удалить контейнер MinIO и Docker image `minio/minio`:

```sh
make minio-clean
```

Показать логи MinIO:

```sh
make minio-logs
```

Зайти в shell контейнера MinIO:

```sh
make minio-shell
```

### Registry

Показать статус Registry и URL:

```sh
make registry-status
```

Создать `docker/registry/auth/htpasswd` из настроек Registry:

```sh
make registry-auth-generate
```

Скачать или обновить Docker image Registry:

```sh
make registry-pull
```

Создать и запустить контейнер Registry:

```sh
make registry-up
```

Запустить уже созданный контейнер Registry:

```sh
make registry-start
```

Остановить контейнер Registry:

```sh
make registry-stop
```

Удалить контейнер Registry:

```sh
make registry-down
```

Удалить контейнер Registry и Docker image `registry:2`:

```sh
make registry-clean
```

Показать логи Registry:

```sh
make registry-logs
```

Зайти в shell контейнера Registry:

```sh
make registry-shell
```

### Registry UI

Показать статус Registry UI и URL:

```sh
make registry-ui-status
```

Скачать или обновить Docker image Registry UI:

```sh
make registry-ui-pull
```

Создать и запустить контейнер Registry UI:

```sh
make registry-ui-up
```

Запустить уже созданный контейнер Registry UI:

```sh
make registry-ui-start
```

Остановить контейнер Registry UI:

```sh
make registry-ui-stop
```

Удалить контейнер Registry UI:

```sh
make registry-ui-down
```

Удалить контейнер Registry UI и Docker image `joxit/docker-registry-ui:latest`:

```sh
make registry-ui-clean
```

Показать логи Registry UI:

```sh
make registry-ui-logs
```

Зайти в shell контейнера Registry UI:

```sh
make registry-ui-shell
```

### SSH

Создать `config/ssh-servers.json`:

```sh
make ssh-init
```

Показать сохраненные SSH серверы, включая пароли:

```sh
make ssh-list
```

Добавить SSH сервер с ручным вводом пароля:

```sh
make ssh-add NAME=prod HOST=example.com PORT=22 USER=root AUTH_TYPE=password PASSWORD=secret PASSWORD_MODE=manual
```

Добавить SSH сервер с `sshpass`:

```sh
make ssh-add NAME=prod HOST=example.com PORT=22 USER=root AUTH_TYPE=password PASSWORD=secret PASSWORD_MODE=sshpass
```

Добавить SSH сервер с ключом:

```sh
make ssh-add NAME=prod HOST=example.com PORT=22 USER=root AUTH_TYPE=key KEY_PATH=~/.ssh/id_rsa
```

Изменить SSH сервер:

```sh
make ssh-update ID=1 NAME=prod HOST=example.com PORT=22 USER=root AUTH_TYPE=password PASSWORD=secret PASSWORD_MODE=manual
```

Удалить SSH сервер:

```sh
make ssh-remove ID=1
```

Проверить SSH подключение:

```sh
make ssh-test ID=1
```

Подключиться к SSH серверу:

```sh
make ssh-connect ID=1
```

Сгенерировать RSA ключ для SSH сервера:

```sh
make ssh-key-generate ID=1
```

Сгенерировать RSA ключ с явным путем и комментарием:

```sh
make ssh-key-generate ID=1 KEY_PATH=~/.ssh/infrastructure/prod_rsa COMMENT=infrastructure-prod
```

Перезаписать существующий RSA ключ:

```sh
make ssh-key-generate ID=1 FORCE=1
```

Отправить публичный RSA ключ на SSH сервер:

```sh
make ssh-key-push ID=1
```

Показать публичный RSA ключ:

```sh
make ssh-key-show ID=1
```

Проверить подключение по RSA ключу:

```sh
make ssh-key-test ID=1
```

### Utilities

Создать архив `archives/NAME-DD-MM-YYYY.tar.gz` из папки:

```sh
make archive NAME=archiveName FOLDER=folderName
```

Показать архивы из папки `archives`:

```sh
make archive-list
```

Распаковать выбранный архив в папку:

```sh
make unarchive NAME=archiveName-DD-MM-YYYY.tar.gz DEST=folderName
```

Удалить архив:

```sh
make archive-delete NAME=archiveName-DD-MM-YYYY.tar.gz
```
