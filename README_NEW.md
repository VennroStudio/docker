# Infrastructure by Vennro Studio

## Первый запуск

Создать локальный `config/settings.json` из дефолтного шаблона:

```sh
make init
```

Команда не запускает контейнеры. Если `config/settings.json` уже существует, файл не перезаписывается.

Проверить настройки:

```sh
make settings-show
```

Изменить настройки Nginx Proxy Manager:

```sh
make settings-set KEY=proxy.npmEmail VALUE=user@example.com
make settings-set KEY=proxy.npmPassword VALUE=secret
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

Проверить статус MariaDB instances и phpMyAdmin:

```sh
make mariadb-status
```

Показать URL phpMyAdmin:

```sh
make phpmyadmin-link
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

Проверить статус Postgres instances и pgAdmin:

```sh
make postgres-status
```

Показать URL pgAdmin:

```sh
make pgadmin-link
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

## Сводка команд

### Project

Показать все команды:

```sh
make help
```

Создать `config/settings.json` из `config/default-settings.json`:

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

Показать статус phpMyAdmin:

```sh
make phpmyadmin-status
```

Показать URL phpMyAdmin:

```sh
make phpmyadmin-link
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

Показать статус pgAdmin:

```sh
make pgadmin-status
```

Показать URL pgAdmin:

```sh
make pgadmin-link
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
