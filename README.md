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

# Подключение к базе данных 

#### Host
```
host.docker.internal:3306
```
#### User
```
root
```
#### Password
```
root
```
#### Port
```
3306
```

Установка на сервере:
```angular2html
apt-get update

apt-get install -y \
  curl \
  software-properties-common \
  ca-certificates \
  apt-transport-https \
  gnupg \
  git \
  make

mkdir -p /etc/apt/keyrings
wget -O- https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor | tee /etc/apt/keyrings/docker.gpg > /dev/null
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list

apt-get update

apt-get install -y make docker-ce apache2-utils docker-compose-plugin

systemctl enable docker
systemctl start docker

mkdir -p /var/www
cd /var/www

git clone https://github.com/VennroStudio/docker data

cd /var/www/data

make init-all
```