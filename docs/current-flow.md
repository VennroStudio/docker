# Текущий flow проекта

Документ фиксирует, как проект работает сейчас: что доступно через Web UI, что доступно через консоль без UI, какие переменные используются и какие дыры уже видны. Цель проекта - заменить Open Server: локальные домены, web-прокси, базы данных и сервисы должны подниматься как единая инфраструктура.

## 1. Общая модель работы

### Как проект устроен сейчас

Проект состоит из нескольких слоев:

- `Makefile` - главный CLI-интерфейс. Почти все операции запускаются через `make`.
- `docker/compose/*.yml` - Docker Compose-файлы сервисов.
- `scripts/*.mjs` и `scripts/hosts.sh` - вспомогательные скрипты для NPM, hosts, MariaDB, Postgres, дампов и БД.
- `web-ui` - графический интерфейс на React/Vite и Node HTTP-server.
- `web-ui/commands.manifest.json` - список команд, доступных в UI через кнопки.
- `docker/services/settings.json` - настройки, которые UI может сохранять вместо ручного редактирования `.env`.
- `docker/services/links.json` - сохраненные связи `container -> domain`, которые UI показывает как ссылки.
- `docker/mariadb/instances.json` и `docker/postgres/instances.json` - реестр созданных инстансов БД.

Web UI не управляет Docker напрямую из браузера. Браузер вызывает backend `web-ui/server.mjs`, backend валидирует параметры, запускает `make`, `node ./scripts/*.mjs`, `docker compose` или `docker exec`, а вывод стримится обратно в терминал UI через SSE.

### Первый запуск

```bash
git clone <repo>
cd infrastructure
make init
make ui
```

`make init` сейчас делает следующее:

- создает `.env` из `.env.example`, если `.env` еще нет;
- создает директории `docker/compose`, `docker/mariadb`, `docker/nginx`, `docker/phpmyadmin`, `docker/postgres`, `docker/registry`, `docker/services`, `dumps/mariadb`, `dumps/postgres`;
- создает пустые `docker/mariadb/instances.json` и `docker/postgres/instances.json`, если их нет;
- запускает `scripts/mariadb-instances.mjs generate` через Docker-образ Node и генерирует `docker/phpmyadmin/config.inc.php`.

### Важная дыра по цели "только Git"

Цель: пользователю нужен только Git, чтобы склонировать проект, а остальное заменяется проектом.

Как сейчас:

- `make init` требует `make`, Docker и Docker Compose, потому что запускает `docker run node:...`.
- `make ui` требует Docker и Docker Compose.
- часть CLI-команд требует локальный `node`, потому что использует `NODE_BIN ?= node` и запускает `@$(NODE_BIN) ./scripts/...`.
- `host-add` и `host-remove` используют `/etc/hosts` и `sudo`, то есть сейчас ориентированы на macOS/Linux, не на Windows.
- `rclone-*`, `archive`, `unarchive`, `clear-mac-copy`, `generate-user`, `import-env` требуют локальные системные утилиты.

Чтобы реально соответствовать цели "только Git", нужен bootstrap-слой: установка/проверка Docker Desktop или Docker Engine, Make/Git Bash/WSL-путь для Windows, единый запуск Node-скриптов через контейнер, настройка hosts для Windows и понятный installer/start script.

## 2. Источники настроек и переменных

### Приоритет настроек в Web UI

Backend UI собирает runtime env в таком порядке:

1. defaults из `web-ui/server/settings-store.mjs`;
2. `.env`;
3. `process.env`;
4. `docker/services/settings.json`;
5. runtime overrides из конкретной операции.

Итоговые значения прокидываются в `make`/скрипты.

### Как читать переменные в этом документе

В разделах ниже перечислены только те переменные из `.env`/runtime env, которые реально читает конкретный модуль или его compose/script.

Параметры команд вроде `DOMAIN=...`, `NAME=...`, `DATABASE=...`, `VERSION=...`, `DUMP_FILE=...` не считаются настройками модуля из `.env`: это аргументы конкретного запуска. Они оставлены в CLI-примерах, но не смешиваются со списком `.env`-переменных.

## 3. Web UI

### Запуск UI через CLI

```bash
make ui
# alias для:
make web-ui-up
```

После запуска UI доступен на `http://localhost:8088`.

Команды:

- `make web-ui-up` - собрать и запустить контейнер `web-ui`.
- `make web-ui-build` - собрать образ `web-ui`.
- `make web-ui-start` - запустить существующий контейнер.
- `make web-ui-stop` - остановить контейнер.
- `make web-ui-down` - удалить контейнер.
- `make web-ui-clean` - удалить контейнер и образ `web-ui`.
- `make web-ui-logs` - смотреть логи контейнера.

### Переменные из `.env`/runtime env

Сам контейнер `web-ui` напрямую не требует переменных из `.env` для запуска. Backend UI дополнительно читает:

- `UI_PORT` - порт Node-сервера UI, default `8088`.
- `UI_STATIC_DIR` - путь к собранному frontend; в Dockerfile задается `/opt/web-ui/dist`.
- `INFRA_SETTINGS_FILE` - путь к settings-файлу, default `docker/services/settings.json`.
- `SERVICE_LINKS_FILE` - путь к файлу ссылок, default `docker/services/links.json`.
- `HOSTS_FILE` - путь к hosts-файлу для операций host add/remove; в Dockerfile задается `/host/etc/hosts`.

### Что UI умеет сейчас

- Главная: показывает статусы сервисов.
- Nginx Proxy Manager page: hosts, proxy hosts, NPM, Docker network.
- Databases page: MariaDB, Postgres, phpMyAdmin, pgAdmin.
- Redis page: Redis и RedisInsight.
- MinIO page: MinIO.
- Registry page: Registry и Registry UI.
- Settings page: сохраняет runtime-настройки в `docker/services/settings.json`.
- Встроенный терминал: показывает output команд, умеет останавливать потоковые команды.
- Shell внутри разрешенных контейнеров: `docker exec -i <container> sh`.

### Что UI не умеет сейчас

- Нет UI для `pull` команд.
- Нет UI для Ansible/deploy.
- Нет UI для rclone.
- Нет UI для архиватора.
- Нет UI для `generate-user` Registry.
- Нет UI для `mariadb-dump-upload` и `postgres-dump-upload`.
- Нет UI для `phpmyadmin-config-generate` и `phpmyadmin-reload` как отдельных действий.
- В shell allowlist добавлены manifest-контейнеры и MariaDB-инстансы, но не Postgres-инстансы через общий shell-route; для Postgres shell используется отдельная instance action.

## 4. Docker network

### Работа через UI

Страница: `Nginx Proxy Manager`.

Действия:

- создать общую сеть `proxy`;
- удалить общую сеть `proxy`.

UI-команды из manifest:

- `network:add` -> `make add-proxy`
- `network:delete` -> `make delete-proxy`

### Работа через консоль

```bash
make add-proxy
make delete-proxy
```

### Переменные из `.env`/runtime env

Из `.env` не использует.

### Дыры и риски

- Все compose-файлы ожидают внешнюю сеть `proxy`; если сеть не создана, сервисы не поднимутся.
- `make add-proxy` падает, если сеть уже существует.
- `make delete-proxy` падает, если сеть не существует или используется контейнерами.
- Нет idempotent-команд вроде `docker network inspect proxy || docker network create proxy`.

## 5. Nginx Proxy Manager и локальные домены

### Работа через UI

Страница: `Nginx Proxy Manager`.

Доступные действия:

- поднять NPM контейнер;
- запустить существующий NPM контейнер;
- остановить NPM контейнер;
- удалить NPM контейнер;
- удалить NPM контейнер и образ;
- смотреть логи NPM;
- создать Docker network `proxy`;
- удалить Docker network `proxy`;
- добавить домен в hosts;
- удалить домен из hosts;
- создать или обновить Proxy Host в NPM;
- удалить Proxy Host и SSL-сертификат в NPM;
- открыть shell в `nginx-container`.

UI-команды:

- `npm:up` -> `make npm-up`
- `npm:start` -> `make npm-start`
- `npm:stop` -> `make npm-stop`
- `npm:down` -> `make npm-down`
- `npm:clean` -> `make npm-clean`
- `npm:logs` -> `make npm-logs`

Формы UI:

- `domain` - домен, например `pma.local`;
- `target` - container name, например `phpmyadmin-container`;
- `port` - внутренний порт контейнера, например `80`;
- `ssl` - включить генерацию и привязку сертификата.

### Полный CLI-flow

1. Создать общую Docker network:

```bash
make add-proxy
```

2. Поднять NPM:

```bash
make npm-up
```

3. Открыть NPM:

```text
http://localhost:81
```

4. Убедиться, что настройки NPM заполнены:

```env
NPM_PUBLIC_URL=http://localhost:81
NPM_API_URL=http://nginx-container:81
NPM_EMAIL=admin@example.com
NPM_PASSWORD=changeme
```

5. Добавить домен в hosts:

```bash
make host-add DOMAIN=pma.local
```

6. Поднять целевой контейнер, например phpMyAdmin:

```bash
make phpmyadmin-up
```

7. Создать proxy host без SSL:

```bash
make app-proxy DOMAIN=pma.local TARGET=phpmyadmin-container PORT=80
```

8. Создать proxy host с SSL:

```bash
make app-proxy DOMAIN=pma.local TARGET=phpmyadmin-container PORT=80 SSL=1
```

9. Удалить proxy host и сертификат:

```bash
make app-proxy-remove DOMAIN=pma.local
```

10. Удалить домен из hosts:

```bash
make host-remove DOMAIN=pma.local
```

11. Жизненный цикл NPM:

```bash
make npm-pull
make npm-start
make npm-stop
make npm-down
make npm-clean
make npm-logs
```

### Переменные из `.env`/runtime env

Из `.env.example`/Settings реально используются NPM automation:

- `NPM_PUBLIC_URL` - URL, который UI показывает пользователю для открытия NPM в браузере.
- `NPM_API_URL` - URL, по которому backend ходит в NPM API.
- `NPM_URL` - legacy/fallback URL для старого CLI-flow; внутри UI runtime теперь заполняется значением `NPM_API_URL`.
- `NPM_EMAIL` - логин NPM.
- `NPM_PASSWORD` - пароль NPM.

Опциональные runtime env, если задать их явно:

- `SSL` - включает SSL, если передан как env; в обычном CLI-flow чаще передается как `make app-proxy ... SSL=1`.
- `SCHEME` - схема upstream, default `http`.
- `CERT_DIR` - папка сертификатов, default `certs`.
- `CERT_DAYS` - срок self-signed сертификата, default `825`.
- `FORCE_CERT` - пересоздать сертификат.
- `SERVICE_LINKS_FILE` - файл локальных ссылок, default `docker/services/links.json`.
- `HOST_IP` - IP для hosts, default `127.0.0.1`.
- `HOSTS_FILE` - hosts-файл, default `/etc/hosts`; в UI-контейнере задается как `/host/etc/hosts`.

Параметры запуска, не обязательные `.env`-настройки:

- `DOMAIN` - локальный домен.
- `TARGET` - container name целевого сервиса.
- `PORT` - внутренний порт целевого сервиса.

### Дыры и риски

- Автоматизация NPM не работает с пользователем, у которого включен 2FA.
- `NPM_API_URL=http://nginx-container:81` требует, чтобы `web-ui` и `nginx-container` были в одной Docker network `proxy`.
- `NPM_URL=http://host.docker.internal:81` оставлен как legacy CLI fallback, но может не работать на Linux без настройки host gateway.
- Для SSL нужен `mkcert` или `openssl`. В Docker-образе `web-ui` есть `docker:27-cli` + node/npm/make, но `openssl`/`mkcert` явно не ставятся. SSL из UI-контейнера может не заработать.
- `host-add`/`host-remove` сейчас Linux/macOS-style. На Windows путь hosts другой: `C:\Windows\System32\drivers\etc\hosts`.
- `hosts.sh` использует `sudo`; в контейнере UI это может быть проблемой, но там `/host/etc/hosts` смонтирован и может зависеть от прав.
- `host-add` не делает backup перед добавлением, только перед удалением.
- `app-proxy-remove` удаляет SSL-сертификат, если найдет его по домену. Если сертификат используется несколькими hosts, есть риск удалить нужный сертификат.
- Нет проверки, что target container реально существует и подключен к сети `proxy`.
- Нет автоматического создания proxy network перед запуском NPM.
- Нет команды `npm-restart`.

## 6. phpMyAdmin

### Работа через UI

Страница: `Databases`.

Доступные действия:

- поднять контейнер phpMyAdmin;
- запустить существующий контейнер;
- остановить контейнер;
- удалить контейнер;
- удалить контейнер и образ;
- смотреть логи;
- открыть shell в `phpmyadmin-container`;
- открыть ссылку, если она известна через `links.json` или default `http://pma.local`.

UI-команды:

- `phpmyadmin:up` -> `make phpmyadmin-up`
- `phpmyadmin:start` -> `make phpmyadmin-start`
- `phpmyadmin:stop` -> `make phpmyadmin-stop`
- `phpmyadmin:down` -> `make phpmyadmin-down`
- `phpmyadmin:clean` -> `make phpmyadmin-clean`
- `phpmyadmin:logs` -> `make phpmyadmin-logs`

### Полный CLI-flow

1. Создать хотя бы один MariaDB-инстанс:

```bash
make mariadb-instance-add VERSION=11.4 DB_USER=admin PASSWORD=secret ROOT_PASSWORD=root-secret
```

2. Сгенерировать phpMyAdmin config:

```bash
make phpmyadmin-config-generate
```

3. Поднять MariaDB-инстанс:

```bash
make mariadb-instance-up NAME=11-4
```

4. Поднять phpMyAdmin:

```bash
make phpmyadmin-up
```

5. При необходимости привязать домен:

```bash
make host-add DOMAIN=pma.local
make app-proxy DOMAIN=pma.local TARGET=phpmyadmin-container PORT=80
```

6. После изменения списка MariaDB-инстансов:

```bash
make phpmyadmin-config-generate
make phpmyadmin-reload
```

7. Остальные команды:

```bash
make phpmyadmin-pull
make phpmyadmin-start
make phpmyadmin-stop
make phpmyadmin-down
make phpmyadmin-clean
make phpmyadmin-logs
```

### Переменные из `.env`/runtime env

Через compose напрямую не использует `.env`. Конфиг серверов генерируется из `docker/mariadb/instances.json`.

### Дыры и риски

- В UI нет отдельных кнопок `phpmyadmin-config-generate` и `phpmyadmin-reload`.
- Default link `http://pma.local` показывается даже если domain не добавлен в hosts и proxy host не создан.
- `phpmyadmin` образ зафиксирован как `platform: linux/amd64`, что может быть медленнее на ARM.
- Если выбран `authMode=config`, пароль MariaDB хранится в `docker/mariadb/instances.json` и генерируемом `config.inc.php`.

## 7. MariaDB

### Работа через UI

Страница: `Databases`.

Доступные действия:

- создать MariaDB-инстанс;
- поднять инстанс;
- запустить существующий контейнер инстанса;
- остановить инстанс;
- удалить контейнер инстанса;
- удалить контейнер и image инстанса;
- смотреть логи инстанса;
- открыть shell в инстансе;
- импортировать `.sql` или `.sql.gz`;
- экспортировать `.sql` или `.sql.gz`;
- вывести список баз выбранного инстанса;
- создать базу;
- удалить базу;
- выбрать dump-файл из `dumps/mariadb`.

Важно: обычная группа `mariadb` в `commands.manifest.json` пустая. Управление MariaDB в UI идет не через manifest, а через отдельные routes `/api/stream/mariadb-*`.

### Полный CLI-flow

1. Создать proxy network:

```bash
make add-proxy
```

2. Создать инстанс MariaDB:

```bash
make mariadb-instance-add VERSION=11.4 DB_USER=admin PASSWORD=secret ROOT_PASSWORD=root-secret
```

Опционально:

```bash
make mariadb-instance-add VERSION=10.6 DB_USER=root PASSWORD=root ROOT_PASSWORD=root PORT=3307 AUTH_MODE=config
make mariadb-instance-add VERSION=11.4 DB_USER=admin PASSWORD=secret ROOT_PASSWORD=root-secret AUTH_MODE=cookie
```

Что создается:

- запись в `docker/mariadb/instances.json`;
- compose-файл `docker/compose/docker-compose-mariadb-<name>.yml`;
- обновленный `docker/phpmyadmin/config.inc.php`.

3. Посмотреть инстансы:

```bash
make mariadb-instance-list
```

4. Поднять инстанс:

```bash
make mariadb-instance-up NAME=11-4
# или
make mariadb-instance-up CONTAINER=mariadb-11-4-container
```

5. Lifecycle:

```bash
make mariadb-instance-start NAME=11-4
make mariadb-instance-stop NAME=11-4
make mariadb-instance-down NAME=11-4
make mariadb-instance-clean NAME=11-4
make mariadb-instance-logs NAME=11-4
make mariadb-instance-shell NAME=11-4
```

Есть alias:

```bash
make mariadb-shell NAME=11-4
```

6. Список баз:

```bash
make mariadb-db-list NAME=11-4
make mariadb-db-list CONTAINER=mariadb-11-4-container
```

7. Создать базу:

```bash
make mariadb-db-create NAME=11-4 DATABASE=app
```

8. Удалить базу:

```bash
make mariadb-db-drop NAME=11-4 DATABASE=app
```

9. Экспорт:

```bash
make mariadb-export NAME=11-4 DATABASE=app DUMP_FILE=dumps/mariadb/app.sql
make mariadb-export NAME=11-4 DATABASE=app DUMP_FILE=dumps/mariadb/app.sql.gz
```

10. Импорт:

```bash
make mariadb-import NAME=11-4 DATABASE=app DUMP_FILE=dumps/mariadb/app.sql
make mariadb-import NAME=11-4 DATABASE=app DUMP_FILE=dumps/mariadb/app.sql.gz
```

11. Загрузить dump на сервер:

```bash
make mariadb-dump-upload FILE=dumps/mariadb/app.sql TARGET_PATH=/remote/path/
```

### Переменные из `.env`/runtime env

Из `.env.example`/Settings реально используются MariaDB-скриптами:

- `MYSQL_ROOT_PASSWORD` - fallback root password, если пароль не найден в `instances.json`.
- `SSH` - используется только `mariadb-dump-upload`.

Дополнительные runtime env, которые скрипты умеют читать, но обычно это параметры запуска:

- `MARIADB_ROOT_PASSWORD` - runtime override root password для операций через UI/backend.
- `MARIADB_NAME` - runtime/env-выбор инстанса по имени.
- `MARIADB_CONTAINER` - runtime/env-выбор инстанса по container name.
- `NAME` - общий runtime/env alias для выбора инстанса.
- `CONTAINER` - общий runtime/env alias для выбора container.
- `ROOT_PASSWORD` - runtime/env fallback root password.
- `FILE` или `DUMP_FILE` - runtime/env fallback dump-файл для import/export/upload.
- `DATABASE` - runtime/env fallback имя базы.
- `NODE_LIBRARY` - Docker image tag Node для команд, которые запускаются через `$(NODE) $(NODE_IMAGE)`.
- `NODE_BIN` - локальная команда Node для команд, которые сейчас запускаются через `$(NODE_BIN)`.

Параметры запуска, не обязательные `.env`-настройки:

- `VERSION`, `DB_USER`, `PASSWORD`, `ROOT_PASSWORD`, `PORT`, `AUTH_MODE` для создания инстанса.
- `NAME` или `CONTAINER` для выбора инстанса в CLI-команде.
- `DATABASE`, `DUMP_FILE`, `FILE`, `TARGET_PATH` для операций с базами/дампами.

### Дыры и риски

- После `make init` старый сгенерированный compose `docker-compose-mariadb-10-6.yml` может существовать, но `instances.json` может быть пустым; CLI работает от `instances.json`, а не от наличия compose-файла.
- Часть MariaDB-команд запускается через локальный `node` (`NODE_BIN ?= node`). Это конфликтует с целью "не нужен Node на компьютере".
- В UI нельзя задать custom `name` для инстанса, только version-based имя.
- В UI форма Postgres/MariaDB instance action не показывает все низкоуровневые script options.
- Удаление `clean` удаляет image `mariadb:<version>` целиком, даже если image используется другими compose-проектами.
- Нет команды удаления записи из `instances.json` без удаления контейнера/volume.
- Пароли хранятся в plain JSON.
- `mariadb-db-drop` защищает только системные базы из списка, но все равно destructive.
- `mariadb-import` не создает базу автоматически; база должна существовать.
- `mariadb-dump-upload` только CLI.

## 8. Postgres и pgAdmin

### Работа через UI

Страница: `Databases`.

Postgres UI умеет:

- создать Postgres-инстанс;
- поднять инстанс;
- запустить существующий контейнер инстанса;
- остановить инстанс;
- удалить контейнер инстанса;
- удалить контейнер и image инстанса;
- смотреть логи инстанса;
- открыть shell в инстансе;
- импортировать `.sql`, `.sql.gz`, `.dump`;
- экспортировать `.sql`, `.sql.gz`, `.dump`;
- вывести список баз выбранного инстанса;
- создать базу;
- удалить базу;
- выбрать dump-файл из `dumps/postgres`.

pgAdmin UI умеет:

- поднять контейнер pgAdmin;
- запустить существующий контейнер;
- остановить контейнер;
- удалить контейнер;
- удалить контейнер и image;
- смотреть логи;
- открыть shell в `pgadmin-container`;
- открыть ссылку `http://localhost:5050` или domain из `links.json`.

UI-команды manifest для Postgres:

- `postgres:up` -> `make postgres-up`
- `postgres:start` -> `make postgres-start`
- `postgres:stop` -> `make postgres-stop`
- `postgres:down` -> `make postgres-down`
- `postgres:clean` -> `make postgres-clean`
- `postgres:logs` -> `make postgres-logs`

UI-команды manifest для pgAdmin:

- `pgadmin:up` -> `make pgadmin-up`
- `pgadmin:start` -> `make pgadmin-start`
- `pgadmin:stop` -> `make pgadmin-stop`
- `pgadmin:down` -> `make pgadmin-down`
- `pgadmin:clean` -> `make pgadmin-clean`
- `pgadmin:logs` -> `make pgadmin-logs`

### Полный CLI-flow Postgres

1. Создать proxy network:

```bash
make add-proxy
```

2. Создать Postgres-инстанс:

```bash
make postgres-instance-add VERSION=17 DB_USER=admin PASSWORD=secret DATABASE=app
```

Что создается:

- запись в `docker/postgres/instances.json`;
- compose-файл `docker/compose/docker-compose-postgres-<name>.yml`.

3. Посмотреть инстансы:

```bash
make postgres-instance-list
```

4. Поднять инстанс:

```bash
make postgres-instance-up NAME=17
# или alias
make postgres-up NAME=17
```

5. Lifecycle:

```bash
make postgres-instance-start NAME=17
make postgres-instance-stop NAME=17
make postgres-instance-down NAME=17
make postgres-instance-clean NAME=17
make postgres-instance-logs NAME=17
make postgres-instance-shell NAME=17
```

Aliases:

```bash
make postgres-start NAME=17
make postgres-stop NAME=17
make postgres-down NAME=17
make postgres-clean NAME=17
make postgres-logs NAME=17
make postgres-shell NAME=17
```

6. Список баз:

```bash
make postgres-db-list NAME=17
make postgres-db-list CONTAINER=postgres-17-container
```

7. Создать базу:

```bash
make postgres-db-create NAME=17 DATABASE=app2
```

8. Удалить базу:

```bash
make postgres-db-drop NAME=17 DATABASE=app2
```

9. Экспорт:

```bash
make postgres-export NAME=17 POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.sql
make postgres-export NAME=17 POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.sql.gz
make postgres-export NAME=17 POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.dump
```

10. Импорт:

```bash
make postgres-import NAME=17 POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.sql
make postgres-import NAME=17 POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.sql.gz
make postgres-import NAME=17 POSTGRES_DB=app DUMP_FILE=dumps/postgres/app.dump
```

11. Загрузить dump на сервер:

```bash
make postgres-dump-upload FILE=dumps/postgres/app.dump TARGET_PATH=/remote/path/
```

Если `FILE` не задан, команда пытается собрать путь из `POSTGRES_HOME_DUMP_PATH` + `POSTGRES_DUMP_NAME`. Если `TARGET_PATH` не задан, использует `POSTGRES_SERVER_DUMP_PATH`.

### Полный CLI-flow pgAdmin

```bash
make pgadmin-up
make pgadmin-start
make pgadmin-stop
make pgadmin-down
make pgadmin-clean
make pgadmin-logs
```

Открыть:

```text
http://localhost:5050
```

### Переменные из `.env`/runtime env

Postgres из `.env.example`/Settings:

- `POSTGRES_USER` - fallback user, если не взят из `instances.json`.
- `POSTGRES_PASSWORD` - fallback password, если не взят из `instances.json`.
- `POSTGRES_DB` - fallback database для import/export и db operations.
- `POSTGRES_HOME_DUMP_PATH` и `POSTGRES_DUMP_NAME` - fallback путь dump-файла, если `FILE`/`DUMP_FILE` не заданы.
- `POSTGRES_SERVER_DUMP_PATH` - default target path для `postgres-dump-upload`.
- `SSH` - используется только `postgres-dump-upload`.

Postgres дополнительные runtime env, которые скрипты умеют читать, но обычно это параметры запуска:

- `POSTGRES_NAME` - runtime/env-выбор инстанса по имени.
- `POSTGRES_CONTAINER` - runtime/env-выбор инстанса по container name.
- `NAME` - общий runtime/env alias для выбора инстанса.
- `CONTAINER` - общий runtime/env alias для выбора container.
- `FILE`, `DUMP_FILE`, `POSTGRES_DUMP_FILE` - runtime/env fallback dump-файл.
- `NODE_LIBRARY` - Docker image tag Node для команд, которые запускаются через `$(NODE) $(NODE_IMAGE)`.
- `NODE_BIN` - локальная команда Node для команд, которые сейчас запускаются через `$(NODE_BIN)`.

pgAdmin из `.env.example`/Settings:

- `PGADMIN_EMAIL`
- `PGADMIN_PASSWORD`
- `PGADMIN_PORT`, default `5050`

Параметры запуска, не обязательные `.env`-настройки:

- `VERSION`, `DB_USER`, `PASSWORD`, `DATABASE` для создания инстанса.
- `NAME` или `CONTAINER` для выбора инстанса в CLI-команде.
- `DATABASE`, `POSTGRES_DB`, `DUMP_FILE`, `FILE`, `TARGET_PATH` для операций с базами/дампами.

### Дыры и риски

- Postgres instance add в `Makefile` не передает `PORT`, хотя скрипт его поддерживает.
- В UI нельзя задать custom `name` и `port` для Postgres-инстанса.
- В UI Postgres action labels используют `text.mariadbInstances.actions`, то есть тексты переиспользованы от MariaDB.
- `postgres-clean` удаляет image `postgres:<version>-alpine` целиком.
- `postgres-import` для `.dump` использует `pg_restore --clean --if-exists`, это destructive для существующих объектов.
- `postgres-import` не создает базу автоматически; база должна существовать.
- `postgres-db-drop` защищает только `postgres`, `template0`, `template1`.
- pgAdmin не автоконфигурируется списком Postgres-инстансов.
- `postgres-dump-upload` только CLI.

## 9. Redis и RedisInsight

### Работа через UI

Страница: `Redis`.

Доступные действия:

- Redis: up/start/stop/down/clean/logs;
- RedisInsight: up/start/stop/down/clean/logs;
- открыть shell в `redis-container` и `redisinsight-container`;
- открыть RedisInsight link `http://localhost:5540`.

UI-команды:

- `redis:up`, `redis:start`, `redis:stop`, `redis:down`, `redis:clean`, `redis:logs`
- `redisinsight:up`, `redisinsight:start`, `redisinsight:stop`, `redisinsight:down`, `redisinsight:clean`, `redisinsight:logs`

### Полный CLI-flow

```bash
make add-proxy
make redis-up
make redisinsight-up
```

Lifecycle Redis:

```bash
make redis-pull
make redis-start
make redis-stop
make redis-down
make redis-clean
make redis-logs
```

Lifecycle RedisInsight:

```bash
make redisinsight-pull
make redisinsight-start
make redisinsight-stop
make redisinsight-down
make redisinsight-clean
make redisinsight-logs
```

Открыть RedisInsight:

```text
http://localhost:5540
```

### Переменные из `.env`/runtime env

Из `.env.example`/Settings:

- `REDIS_PASSWORD` - пароль Redis.

### Дыры и риски

- Redis не пробрасывает порт наружу, доступен только внутри Docker network `proxy`.
- RedisInsight не получает готовую настройку подключения к Redis.
- `redis` compose содержит `env_file: ../../.env`; если `.env` нет, compose может упасть.
- Нет UI-команд `pull`.
- Нет отдельной команды shell через CLI, только через UI.

## 10. MinIO

### Работа через UI

Страница: `MinIO`.

Доступные действия:

- up/start/stop/down/clean/logs;
- открыть shell в `minio-container`;
- открыть ссылку `http://localhost:3901`.

UI-команды:

- `minio:up`, `minio:start`, `minio:stop`, `minio:down`, `minio:clean`, `minio:logs`

### Полный CLI-flow

```bash
make add-proxy
make minio-up
```

Открыть:

```text
http://localhost:3901
```

Lifecycle:

```bash
make minio-pull
make minio-start
make minio-stop
make minio-down
make minio-clean
make minio-logs
```

### Переменные из `.env`/runtime env

Из `.env.example`/Settings:

- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`

### Дыры и риски

- Данные хранятся в `../../storage` относительно compose-файла, то есть в корневой папке `storage`.
- Нет `.gitignore` записи для `/storage`; если появится, ее можно случайно добавить в git.
- Нет UI-команд для bucket/user/policy/access keys.
- Нет healthcheck.
- Нет UI-команды `pull`.

## 11. Docker Registry и Registry UI

### Работа через UI

Страница: `Registry`.

Доступные действия:

- Registry: up/start/stop/down/clean/logs;
- Registry UI: up/start/stop/down/clean/logs;
- открыть shell в `registry-container` и `registry-ui-container`;
- открыть ссылку `http://localhost:5081`.

UI-команды:

- `registry:up`, `registry:start`, `registry:stop`, `registry:down`, `registry:clean`, `registry:logs`
- `registry-ui:up`, `registry-ui:start`, `registry-ui:stop`, `registry-ui:down`, `registry-ui:clean`, `registry-ui:logs`

### Полный CLI-flow

1. Создать htpasswd:

```bash
make generate-user
```

2. Поднять Registry:

```bash
make registry-up
```

3. Поднять Registry UI:

```bash
make registry-ui-up
```

4. Открыть:

```text
http://localhost:5081
```

Lifecycle Registry:

```bash
make registry-pull
make registry-start
make registry-stop
make registry-down
make registry-clean
make registry-logs
```

Lifecycle Registry UI:

```bash
make registry-ui-pull
make registry-ui-start
make registry-ui-stop
make registry-ui-down
make registry-ui-clean
make registry-ui-logs
```

### Переменные из `.env`/runtime env

Из `.env.example`/Settings:

- `REGISTRY_USER`
- `REGISTRY_PASSWORD`

Дополнительные runtime env:

- `REGISTRY_UI_PORT`, default `5081`

### Дыры и риски

- `generate-user` требует локальную утилиту `htpasswd`, но она не устанавливается проектом на локальной машине.
- В UI нет кнопки `generate-user`, поэтому Registry может не стартовать корректно без предварительной CLI-команды.
- Registry UI ожидает `registry-container:5000`; если Registry не запущен или не в сети `proxy`, UI не заработает.
- Registry наружу открыт на `localhost:5000`.
- Нет UI для login/tag/push/pull образов.
- Нет UI-команд `pull`.

## 12. Ansible и сервер

### Работа через UI

Сейчас отсутствует.

### Полный CLI-flow

```bash
make ansible-build
make ansible-setup
make ansible-clean
```

Импорт `.env.server` на сервер:

```bash
make import-env TARGET_PATH=/remote/project/.env
```

Что делает Ansible playbook:

- ставит зависимости;
- ставит Docker Engine и Compose plugin на Ubuntu-сервер;
- добавляет пользователя в группу `docker`;
- клонирует репозиторий `https://github.com/VennroStudio/docker.git` в `/home/vennro/infrastructure`;
- копирует `docker/ansible/.env.server` в `.env` на сервере;
- логинится в Docker Hub;
- запускает `make init`.

### Переменные из `.env`/runtime env

Из `.env.example`/Settings:

- `SERVER_HOST`
- `SERVER_PORT`
- `SERVER_USER`
- `SERVER_SSH_KEY`
- `SSH`
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_PASSWORD`

### Дыры и риски

- Репозиторий в playbook захардкожен как `https://github.com/VennroStudio/docker.git`, а текущий проект называется `infrastructure`.
- Путь `/home/vennro/infrastructure` захардкожен.
- `docker_branch: main` захардкожен.
- `make init` не поднимает сервисы, только инициализирует файлы.
- Нет UI.
- `docker/ansible/.env.server` присутствует как server-only файл и может содержать секреты; он должен оставаться вне git.
- `import-env` требует `scp` локально.

## 13. Rclone

### Работа через UI

Сейчас отсутствует.

### CLI-flow

```bash
make rclone-install
make rclone-config
make rclone-test
make rclone-backup-s3
```

Что делают команды:

- `rclone-install` - устанавливает rclone через `curl https://rclone.org/install.sh | sudo bash`.
- `rclone-config` - запускает интерактивную настройку rclone.
- `rclone-test` - проверяет `rclone ls yadisk:test-connect/`.
- `rclone-backup-s3` - копирует `/home/vennro/infrastructure/storage` в `yadisk:backup/storage`.

### Переменные из `.env`/runtime env

Из `.env` не использует.

### Дыры и риски

- `rclone-backup-s3` есть в Makefile, но не показывается в `make help`, потому что help-regex не поддерживает цифру в имени target.
- Все команды требуют локальный `rclone`, `curl`, `sudo`, интерактивную настройку.
- Пути захардкожены под пользователя/сервер `vennro`.
- Нет UI.

## 14. Архиватор

### Работа через UI

Сейчас отсутствует.

### CLI-flow

Создать архив:

```bash
make archive FOLDER=storage
```

Будет создан файл:

```text
data-DD-MM-YYYY.tar.gz
```

Распаковать архив:

```bash
make unarchive DATE-ARG=27-05-2026
```

Удалить macOS resource fork копии:

```bash
make clear-mac-copy
```

### Переменные из `.env`/runtime env

Из `.env` не использует.

Параметры запуска, не обязательные `.env`-настройки:

- `FOLDER`
- `DATE-ARG`

### Дыры и риски

- `DATE-ARG` с дефисом - неудобное имя переменной для shell/скриптов.
- `archive` пишет архив в корень проекта.
- Нет проверки, что `FOLDER` задан и существует.
- Нет UI.

## 15. Git helper

### Работа через UI

Сейчас отсутствует.

### CLI-flow

```bash
make push
```

Команда делает:

```bash
git add .
git commit -m "update"
git push
```

### Дыры и риски

- Очень опасная команда: добавляет вообще все файлы, включая случайные локальные изменения, если они не в `.gitignore`.
- Сообщение коммита всегда `update`.
- Нет проверки ветки, статуса, секретов.

## 16. Settings UI

### Работа через UI

Страница: `Settings`.

Можно менять группы:

- Environment: `NODE_LIBRARY`;
- Nginx Proxy Manager: `NPM_PUBLIC_URL`, `NPM_API_URL`, `NPM_EMAIL`, `NPM_PASSWORD`;
- MariaDB: `MYSQL_ROOT_PASSWORD`;
- Server/deploy: `SSH`, `SERVER_HOST`, `SERVER_PORT`, `SERVER_USER`, `SERVER_SSH_KEY`;
- Registry/Docker Hub: `REGISTRY_USER`, `REGISTRY_PASSWORD`, `DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD`;
- MinIO/Redis: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `REDIS_PASSWORD`;
- Postgres/pgAdmin: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_DUMP_NAME`, `POSTGRES_HOME_DUMP_PATH`, `POSTGRES_SERVER_DUMP_PATH`, `PGADMIN_EMAIL`, `PGADMIN_PASSWORD`.

Сохраняет в:

```text
docker/services/settings.json
```

### Работа через CLI

CLI напрямую settings.json не редактирует. Можно редактировать `.env` или `docker/services/settings.json` вручную.

### Дыры и риски

- Секреты сохраняются plain text.
- Settings UI не синхронизирует `.env`, а только влияет на runtime env backend UI.
- Консольные `make` команды вне UI читают `.env`, но не читают `docker/services/settings.json`, если они не запускаются через UI backend.
- Получается расхождение: команда из UI может использовать одно значение, команда в терминале - другое.

## 17. Сводка GUI vs CLI

| Возможность | UI | CLI |
| --- | --- | --- |
| Init проекта | Нет | Да |
| Web UI lifecycle | Нет внутри UI | Да |
| Docker network create/delete | Да | Да |
| NPM lifecycle | Да, кроме pull | Да |
| Hosts add/remove | Да | Да |
| NPM proxy host create/delete | Да | Да |
| phpMyAdmin lifecycle | Да, кроме pull/reload/config-generate | Да |
| MariaDB instance create/lifecycle | Да | Да |
| MariaDB import/export/db create/drop/list | Да | Да |
| MariaDB dump upload | Нет | Да |
| Postgres instance create/lifecycle | Да | Да |
| Postgres import/export/db create/drop/list | Да | Да |
| Postgres dump upload | Нет | Да |
| pgAdmin lifecycle | Да, кроме pull | Да |
| Redis lifecycle | Да, кроме pull | Да |
| RedisInsight lifecycle | Да, кроме pull | Да |
| MinIO lifecycle | Да, кроме pull | Да |
| Registry lifecycle | Да, кроме pull/generate-user | Да |
| Registry UI lifecycle | Да, кроме pull | Да |
| Ansible deploy | Нет | Да |
| Rclone | Нет | Да |
| Архиватор | Нет | Да |
| Git auto push | Нет | Да |
| Shell в контейнеры | Да | Частично через instance shell |
| Settings | Да | Только ручное `.env` |

## 18. Главные дыры для замены Open Server

1. **Bootstrap не соответствует цели "только Git".** Сейчас нужны Docker, Docker Compose, make, sudo/hosts access, местами Node и системные утилиты.
2. **Windows не поддержан полноценно.** Hosts path, shell scripts, sudo, `/var/run/docker.sock`, `/etc/hosts`, tar/find/scp/curl рассчитаны на Unix-like окружение или Docker Desktop с Linux-контейнерами.
3. **Разные источники настроек.** UI runtime читает `settings.json`, CLI читает `.env`. Это может давать разные результаты для одной и той же операции.
4. **UI покрывает не все CLI.** Нет pull, deploy, rclone, archive, dump upload, generate-user, часть phpMyAdmin service actions.
5. **Node dependency inconsistent.** Часть команд запускается через Docker Node, часть через локальный `node`.
6. **Секреты в plain text.** `.env`, `settings.json`, `instances.json`, phpMyAdmin config содержат пароли.
7. **Нет healthchecks и readiness.** UI может показать команду выполненной, но сервис еще не готов.
8. **Нет idempotent-safe network flow.** Большинство команд падает на already exists/not found.
9. **Нет единого installer/start UX.** Для Open Server replacement нужен один очевидный entrypoint: `start`, `stop`, `status`, `open`, `doctor`.
10. **Нет диагностики окружения.** Нужна команда `doctor`: Docker работает, compose есть, ports свободны, proxy network есть, hosts writable, NPM credentials valid.
11. **Нет profile/preset приложений.** Open Server обычно нужен для сайтов; сейчас есть инфраструктура, но нет flow "создать сайт/app: папка + домен + nginx + php/node + db".
12. **Нет управления PHP/Composer/Node runtimes как сервисами.** Есть `library-command/node` и `library-command/composer`, но они не интегрированы в UI/Make main flow.
13. **Нет миграции/импорта существующих Open Server проектов.**
14. **Нет контроля портов.** Некоторые порты захардкожены: 80, 81, 443, 3900, 3901, 5000, 5050, 5081, 5540.
15. **Нет централизованного описания сервисов.** Сервисы описаны в Makefile, compose, manifest, i18n, links отдельно; легко получить рассинхрон.

## 19. Рекомендуемый следующий план закрытия дыр

1. Сделать `make doctor`:
   - Docker/Compose available;
   - proxy network exists;
   - ports free;
   - hosts writable strategy;
   - `.env` exists and required vars filled;
   - NPM API auth works.

2. Привести CLI к правилу "Node только через Docker":
   - заменить `NODE_BIN ?= node` на запуск через `$(NODE) $(NODE_IMAGE) node ...`;
   - либо добавить bootstrap Node в контейнере для всех scripts.

3. Развести настройки:
   - выбрать один source of truth;
   - либо CLI тоже читает `docker/services/settings.json`;
   - либо Settings UI редактирует `.env`.

4. Добавить Windows strategy:
   - `scripts/hosts.ps1` или Node-based hosts editor;
   - `start.ps1`/`start.cmd`;
   - WSL/Git Bash/Docker Desktop detection.

5. Расширить UI до parity с CLI:
   - `pull`;
   - Registry `generate-user`;
   - dump upload;
   - phpMyAdmin reload/config-generate;
   - Ansible/deploy либо скрыть как server-only advanced.

6. Добавить module registry:
   - единый JSON/TS source для commands, env vars, compose file, container names, ports, UI labels.

7. Добавить app/site flow:
   - создать проект;
   - выбрать runtime;
   - создать домен;
   - создать proxy host;
   - создать DB;
   - открыть сайт.

8. Добавить безопасные команды:
   - idempotent network create/delete;
   - restart для сервисов;
   - status для каждого модуля;
   - dry-run/preview.
