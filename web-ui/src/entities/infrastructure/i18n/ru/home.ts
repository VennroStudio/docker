import type { AppText } from "../types";

export const ruHome = {
  hero: {
    eyebrow: "Инфраструктура",
    lead: "Управляй локальными доменами, базами данных, хранилищем, кешем, registry и SSH из одной панели.",
    title: "Панель управления",
  },
  serviceCards: {
    ansible: {
      description: "Сборка Ansible контейнера, переменные deploy и установка на SSH сервер.",
      meta: "Deploy service",
      title: "Ansible",
    },
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
    proxy: {
      description: "Управление доменами, SSL и контейнером NPM",
      meta: "NPM module",
      title: "Nginx Proxy Manager",
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
    utilities: {
      description: "Архивы, распаковка и локальные инструменты проекта.",
      meta: "Tools service",
      title: "Утилиты",
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
  projects: {
    countLabel: (count) => {
      const mod10 = count % 10;
      const mod100 = count % 100;
      const word =
        mod10 === 1 && mod100 !== 11
          ? "проект"
          : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
            ? "проекта"
            : "проектов";
      return `${count} ${word}`;
    },
    empty: "Проектов пока нет.",
    eyebrow: "Web projects",
    loading: "Загрузка проектов...",
    openLabel: (name) => `Открыть проект ${name}`,
    title: "Проекты",
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
