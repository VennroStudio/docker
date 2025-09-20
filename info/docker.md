## Узнать порт контейнера
```
docker inspect название контейнера | grep -A 3 "ExposedPorts"
```