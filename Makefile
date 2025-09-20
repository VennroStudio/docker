init-all:
	@echo "🚀 Инициализация всех контейнеров..."
	$(MAKE) -C nginx init
	$(MAKE) -C mariadb init
	$(MAKE) -C phpmyadmin up
	@echo "✅ Все контейнеры запущены!"

up-all:
	$(MAKE) -C mariadb up
	$(MAKE) -C nginx up
	$(MAKE) -C phpmyadmin up

down-all:
	$(MAKE) -C mariadb down
	$(MAKE) -C nginx down
	$(MAKE) -C phpmyadmin down

push:
	git add .
	git commit -m "update"
	git push

.PHONY: init-all up-all down-all push
