# Infrastructure Console Flow
## Первый запуск

```sh
make init
```

`make init` только создает `config/settings.json` из `config/default-settings.json`, если файла еще нет. Контейнеры не запускаются.

Проверить настройки:

```sh
make settings-show
```

Изменить настройку:

```sh
make settings-set KEY=proxy.npmEmail VALUE=user@example.com
make settings-set KEY=proxy.npmPassword VALUE=secret
```

## Nginx Proxy Manager

Создать Docker network:

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

Ответ:

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

## Локальный домен для NPM

Добавить домен в hosts:

```sh
make host-add DOMAIN=npm.local
```

Создать proxy host для самого NPM:

```sh
make app-proxy DOMAIN=npm.local TARGET=nginx-container PORT=81
```

Если нужен SSL:

```sh
make app-proxy DOMAIN=npm.local TARGET=nginx-container PORT=81 SSL=1
```

Когда `TARGET=nginx-container`, скрипт обновит `config/settings.json`:

```json
{
  "proxy": {
    "npmPublicUrl": "http://npm.local"
  }
}
```

Проверить, что URL изменился:

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
    "npmPublicUrl": "http://localhost:81"
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

## NPM
Скачать или обновить Docker image NPM.
```sh
make npm-pull
```
Создать и запустить контейнер NPM через `docker-compose-npm.yml`.
```sh
make npm-up
```
Запустить уже созданный контейнер NPM.
```sh
make npm-start
```
Остановить контейнер NPM.
```sh
make npm-stop
```
Удалить контейнер NPM, но не удалять image.
```sh
make npm-down
```
Удалить контейнер NPM и Docker image `jc21/nginx-proxy-manager:latest`.
```sh
make npm-clean
```
Показать логи NPM.
```sh
make npm-logs
```