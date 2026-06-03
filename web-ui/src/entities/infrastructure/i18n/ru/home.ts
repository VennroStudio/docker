import type { AppText } from "../types";

export const ruHome = {
  hero: {
    eyebrow: "Инфраструктура",
    lead: "Управляй локальными доменами, базами данных, хранилищем, кешем, registry и SSH из одной панели.",
    title: "Панель управления",
  },
  serviceCards: {
    mariadb: {
      description: "Mariadb, Postgres и UI управление базами данных",
      meta: "Data module",
      title: "Базы данных",
    },
    minio: {
      description: "S3-совместимое хранилище с доступом к консоли.",
      meta: "Storage module",
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
      description: "Управление доменами, SSL и контейнером NPM",
      meta: "NPM module",
      title: "Nginx Proxy Manager",
    },
    projects: {
      description: "Локальные сайты на Docker с Apache, nginx + PHP-FPM или Node.",
      meta: "Web module",
      title: "Проекты",
    },
    redis: {
      description: "Redis и UI управление кэшем",
      meta: "Cache module",
      title: "Кэширование",
    },
    registry: {
      description: "Registry и UI управление образами",
      meta: "Images module",
      title: "Private Docker Registry",
    },
    ssh: {
      description: "Хранение SSH серверов, подключение через терминал и управление RSA ключами",
      meta: "SSH service",
      title: "SSH Control Panel",
    },
  },
  modules: {
    eyebrow: "Панель модулей",
    title: "Управление модулями",
  },
  services: {
    eyebrow: "Панель сервисов",
    title: "Управление сервисами",
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
