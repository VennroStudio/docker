import type { AppText } from "../types";

export const ruHome = {
  hero: {
    action: "Настроить домен",
    eyebrow: "Локальная инфраструктура",
    lead: "Управляй локальными доменами, Nginx Proxy Manager, базами, хранилищем и логами из одного темного рабочего пространства.",
    title: "Open-server панель управления Docker сервисами.",
  },
  serviceCards: {
    mariadb: {
      description: "MariaDB, PostgreSQL, phpMyAdmin и pgAdmin на одной странице.",
      meta: "SQL stack",
      title: "Базы данных",
    },
    minio: {
      description: "S3-совместимое хранилище с доступом к консоли.",
      meta: "Storage",
      title: "MinIO",
    },
    nginx: {
      description: "Жизненный цикл контейнера, логи proxy и доступ к NPM.",
      meta: "Port 81",
      title: "Nginx Proxy Manager",
    },
    postgres: {
      description: "Команды PostgreSQL и pgAdmin.",
      meta: "DB tools",
      title: "Postgres",
    },
    proxy: {
      description: "Домены, proxy hosts и контейнер NPM.",
      meta: "NPM module",
      title: "Nginx Proxy Manager",
    },
    redis: {
      description: "Cache service, RedisInsight и поток логов.",
      meta: "Cache",
      title: "Redis",
    },
    registry: {
      description: "Private Docker Registry, UI и логи образов.",
      meta: "Images",
      title: "Registry",
    },
    ssh: {
      description: "Серверы, пароли, RSA ключи и SSH терминал.",
      meta: "Servers",
      title: "SSH",
    },
  },
  services: {
    eyebrow: "Панели сервисов",
    title: "Запускай каждый сервис отдельно",
  },
  workflow: {
    eyebrow: "Локальный flow",
    steps: [
      {
        title: "Запускай только нужное",
        detail: "У каждого сервиса есть свои up, start, stop, down, clean и logs команды.",
      },
      {
        title: "Привяжи локальный домен",
        detail: "Добавь запись в /etc/hosts, создай proxy host в NPM и при необходимости включи SSL.",
      },
    ],
    title: "Рекомендуемый порядок",
  },
} satisfies AppText["home"];
