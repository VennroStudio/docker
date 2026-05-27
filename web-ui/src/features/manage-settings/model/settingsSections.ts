import type { AppText } from "@/entities/infrastructure";
import type { AppSettings } from "@/entities/settings";

export type SettingsGroup = keyof AppSettings;

export type SettingsFieldDefinition = {
  autocomplete?: string;
  env: string;
  group: SettingsGroup;
  label: string;
  name: string;
  placeholder?: string;
  type?: "password" | "text";
};

export type SettingsSectionDefinition = {
  id: keyof AppText["settings"]["sections"];
  fields: SettingsFieldDefinition[];
};

export const settingsSections: SettingsSectionDefinition[] = [
  {
    id: "environment",
    fields: [
      {
        env: "NODE_LIBRARY",
        group: "environment",
        label: "Node image",
        name: "nodeLibrary",
        placeholder: "24-bookworm",
      },
    ],
  },
  {
    id: "proxy",
    fields: [
      {
        env: "NPM_URL",
        group: "proxy",
        label: "NPM URL",
        name: "npmUrl",
        placeholder: "http://host.docker.internal:81",
      },
      { autocomplete: "username", env: "NPM_EMAIL", group: "proxy", label: "NPM email", name: "npmEmail" },
      {
        autocomplete: "current-password",
        env: "NPM_PASSWORD",
        group: "proxy",
        label: "NPM password",
        name: "npmPassword",
        type: "password",
      },
    ],
  },
  {
    id: "mariadb",
    fields: [
      {
        autocomplete: "current-password",
        env: "MYSQL_ROOT_PASSWORD",
        group: "mariadb",
        label: "Root password",
        name: "rootPassword",
        type: "password",
      },
    ],
  },
  {
    id: "deployment",
    fields: [
      { env: "SSH", group: "deployment", label: "SSH shortcut", name: "ssh", placeholder: "user@host" },
      { env: "SERVER_HOST", group: "deployment", label: "Server host", name: "host", placeholder: "84.22.144.239" },
      { env: "SERVER_PORT", group: "deployment", label: "Server port", name: "port", placeholder: "22" },
      { env: "SERVER_USER", group: "deployment", label: "Server user", name: "user", placeholder: "vennro" },
      {
        env: "SERVER_SSH_KEY",
        group: "deployment",
        label: "SSH key",
        name: "sshKey",
        placeholder: "/root/.ssh/id_rsa",
      },
    ],
  },
  {
    id: "registry",
    fields: [
      {
        autocomplete: "username",
        env: "REGISTRY_USER",
        group: "registry",
        label: "Registry user",
        name: "registryUser",
      },
      {
        autocomplete: "current-password",
        env: "REGISTRY_PASSWORD",
        group: "registry",
        label: "Registry password",
        name: "registryPassword",
        type: "password",
      },
      {
        autocomplete: "username",
        env: "DOCKERHUB_USERNAME",
        group: "registry",
        label: "Docker Hub user",
        name: "dockerhubUsername",
      },
      {
        autocomplete: "current-password",
        env: "DOCKERHUB_PASSWORD",
        group: "registry",
        label: "Docker Hub password",
        name: "dockerhubPassword",
        type: "password",
      },
    ],
  },
  {
    id: "storage",
    fields: [
      {
        autocomplete: "username",
        env: "MINIO_ROOT_USER",
        group: "storage",
        label: "MinIO root user",
        name: "minioRootUser",
      },
      {
        autocomplete: "current-password",
        env: "MINIO_ROOT_PASSWORD",
        group: "storage",
        label: "MinIO root password",
        name: "minioRootPassword",
        type: "password",
      },
      {
        autocomplete: "current-password",
        env: "REDIS_PASSWORD",
        group: "storage",
        label: "Redis password",
        name: "redisPassword",
        type: "password",
      },
    ],
  },
  {
    id: "postgres",
    fields: [
      { autocomplete: "username", env: "POSTGRES_USER", group: "postgres", label: "Postgres user", name: "user" },
      {
        autocomplete: "current-password",
        env: "POSTGRES_PASSWORD",
        group: "postgres",
        label: "Postgres password",
        name: "password",
        type: "password",
      },
      { env: "POSTGRES_DB", group: "postgres", label: "Postgres database", name: "database", placeholder: "mydb" },
      {
        env: "POSTGRES_DUMP_NAME",
        group: "postgres",
        label: "Postgres dump name",
        name: "dumpName",
        placeholder: "app.dump",
      },
      {
        env: "POSTGRES_HOME_DUMP_PATH",
        group: "postgres",
        label: "Postgres local dump path",
        name: "homeDumpPath",
        placeholder: "dumps/postgres/",
      },
      {
        env: "POSTGRES_SERVER_DUMP_PATH",
        group: "postgres",
        label: "Postgres server dump path",
        name: "serverDumpPath",
        placeholder: "/home/user/infrastructure/",
      },
      {
        autocomplete: "username",
        env: "PGADMIN_EMAIL",
        group: "postgres",
        label: "pgAdmin email",
        name: "pgAdminEmail",
      },
      {
        autocomplete: "current-password",
        env: "PGADMIN_PASSWORD",
        group: "postgres",
        label: "pgAdmin password",
        name: "pgAdminPassword",
        type: "password",
      },
    ],
  },
];
