# Руководство по добавлению домена в hosts

### Выполнить команду
```bash   
	sudo nano /etc/hosts
```
### Добавить в файл
```
127.0.0.1   pma.local
```

# Руководство по самозаверенному сертификату

### Создай папку для сертификатов
```bash  
mkdir ./certs
```

### Сгенерировать сертификат для pma.local
```bash  
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout ./certs/pma.key \
-out ./certs/pma.crt \
-subj "/CN=pma.local"
```