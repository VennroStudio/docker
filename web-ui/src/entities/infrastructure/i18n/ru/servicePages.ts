import type { AppText } from "../types";

export const ruServicePages = {
  mariadb: {
    description: "Управляй MariaDB, PostgreSQL, phpMyAdmin и pgAdmin на одной странице.",
    eyebrow: "SQL stack",
    panelEyebrow: "База данных",
    panelTitle: "Базы данных",
  },
  minio: {
    description: "Управляй MinIO storage и смотри поток логов сервиса.",
    eyebrow: "Storage",
    panelEyebrow: "S3 storage",
    panelTitle: "Команды MinIO",
  },
  nginx: {
    description: "Управляй жизненным циклом NPM контейнера и смотри логи proxy manager.",
    eyebrow: "Nginx Proxy Manager",
    panelEyebrow: "Proxy manager",
    panelTitle: "Команды NPM",
  },
  postgres: {
    description: "Управляй контейнерами PostgreSQL и pgAdmin.",
    eyebrow: "Database",
    panelEyebrow: "База данных",
    panelTitle: "Команды Postgres",
  },
  proxy: {
    description: "Создавай локальные host записи, управляй proxy hosts и контейнером NPM.",
    eyebrow: "Nginx Proxy Manager",
    panelEyebrow: "Proxy host",
    panelTitle: "Маршрутизация и NPM",
  },
  redis: {
    description: "Управляй контейнерами Redis и RedisInsight.",
    eyebrow: "Cache",
    panelEyebrow: "Cache",
    panelTitle: "Команды Redis",
  },
  registry: {
    description: "Управляй private registry, UI и потоками логов.",
    eyebrow: "Docker registry",
    panelEyebrow: "Registry",
    panelTitle: "Команды Registry",
  },
  ssh: {
    description: "Храни SSH серверы, подключайся через терминал и управляй RSA ключами.",
    eyebrow: "SSH",
    panelEyebrow: "Server",
    panelTitle: "SSH серверы",
  },
  utilities: {
    description: "Локальные инструменты проекта.",
    eyebrow: "Utilities",
    panelEyebrow: "Utilities",
    panelTitle: "Утилиты",
  },
} satisfies AppText["servicePages"];
