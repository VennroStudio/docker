# WordPress Docker

### 1. Создать базу данных для Wordpress

```bash
make create-db
```

### 2. Запустить контейнеры

```bash
make install
```
### 3. Создать url в hosts

```bash
sudo nano /etc/hosts
```
```aiignore
127.0.0.1   wordpress.local
```
### 4. Подключить в NPM
```
wordpress.local
```
```
wordpress-container
```
```
80
```

---

## Команды

```bash
make help       # Показать список команд
```

---

## Плагины

#### Платные плагины подключены как git-субмодули.

```bash
git submodule update --init --recursive
```

#### Отвязать плагин от git

```bash
rm -rf wordpress/wp-content/plugins/advanced-custom-fields-pro/.git
rm -rf wordpress/wp-content/plugins/wp-rocket/.git
```

### Список плагинов

| Плагин | Репозиторий |
|--------|------------|
| ACF Pro | https://github.com/wordpress-premium/advanced-custom-fields-pro |
| WP Rocket | https://github.com/wordpress-premium/wp-rocket |