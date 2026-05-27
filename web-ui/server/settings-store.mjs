import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(serverDir, "../..");
const settingsFile = path.resolve(projectRoot, process.env.INFRA_SETTINGS_FILE || "docker/services/settings.json");
const envFile = path.resolve(projectRoot, ".env");

export const defaultSettings = {
  environment: {
    nodeLibrary: "24-bookworm",
  },
  proxy: {
    npmUrl: "http://host.docker.internal:81",
    npmEmail: "",
    npmPassword: "",
  },
  mariadb: {
    defaultVersion: "10.6",
    rootPassword: "root",
    defaultDatabase: "app",
    dumpName: "app.sql.gz",
    homeDumpPath: "dumps/mariadb/",
    serverDumpPath: "/home/vennro/infrastructure/",
  },
  deployment: {
    ssh: "",
    host: "",
    port: "22",
    user: "",
    sshKey: "/root/.ssh/id_rsa",
  },
  registry: {
    registryUser: "",
    registryPassword: "",
    dockerhubUsername: "",
    dockerhubPassword: "",
  },
  storage: {
    minioRootUser: "",
    minioRootPassword: "",
    redisPassword: "",
  },
  postgres: {
    user: "admin",
    password: "",
    database: "app",
    dumpName: "app.dump",
    homeDumpPath: "dumps/postgres/",
    serverDumpPath: "/home/vennro/infrastructure/",
    pgAdminEmail: "admin@admin.local",
    pgAdminPassword: "",
  },
};

export async function readSettings() {
  return {
    exists: existsSync(settingsFile),
    path: settingsFile,
    settings: mergeSettings(
      defaultSettings,
      envToSettings(await readEnvFile()),
      envToSettings(process.env),
      await readSettingsFile(),
    ),
  };
}

export async function writeSettings(settings) {
  const nextSettings = normalizeSettings(settings);
  await mkdir(path.dirname(settingsFile), { recursive: true });
  await writeFile(settingsFile, `${JSON.stringify(nextSettings, null, 2)}\n`, "utf8");
  return { exists: true, path: settingsFile, settings: nextSettings };
}

export function getRuntimeEnv(overrides = {}) {
  const settings = mergeSettings(
    defaultSettings,
    envToSettings(readEnvFileSync()),
    envToSettings(process.env),
    readSettingsFileSync(),
  );
  return { ...process.env, ...settingsToEnv(settings), ...overrides };
}

export function settingsToEnv(settings) {
  const value = normalizeSettings(settings);

  return dropEmptyValues({
    DB_NAME: value.mariadb.defaultDatabase,
    DOCKERHUB_PASSWORD: value.registry.dockerhubPassword,
    DOCKERHUB_USERNAME: value.registry.dockerhubUsername,
    DUMP_NAME: value.mariadb.dumpName,
    HOME_DUMP_PATH: value.mariadb.homeDumpPath,
    MARIADB_VERSION: value.mariadb.defaultVersion,
    MINIO_ROOT_PASSWORD: value.storage.minioRootPassword,
    MINIO_ROOT_USER: value.storage.minioRootUser,
    MYSQL_ROOT_PASSWORD: value.mariadb.rootPassword,
    NODE_LIBRARY: value.environment.nodeLibrary,
    NPM_EMAIL: value.proxy.npmEmail,
    NPM_PASSWORD: value.proxy.npmPassword,
    NPM_URL: value.proxy.npmUrl,
    PGADMIN_EMAIL: value.postgres.pgAdminEmail,
    PGADMIN_PASSWORD: value.postgres.pgAdminPassword,
    POSTGRES_DB: value.postgres.database,
    POSTGRES_DUMP_NAME: value.postgres.dumpName,
    POSTGRES_HOME_DUMP_PATH: value.postgres.homeDumpPath,
    POSTGRES_PASSWORD: value.postgres.password,
    POSTGRES_SERVER_DUMP_PATH: value.postgres.serverDumpPath,
    POSTGRES_USER: value.postgres.user,
    REDIS_PASSWORD: value.storage.redisPassword,
    REGISTRY_PASSWORD: value.registry.registryPassword,
    REGISTRY_USER: value.registry.registryUser,
    SERVER_DUMP_PATH: value.mariadb.serverDumpPath,
    SERVER_HOST: value.deployment.host,
    SERVER_PORT: value.deployment.port,
    SERVER_SSH_KEY: value.deployment.sshKey,
    SERVER_USER: value.deployment.user,
    SSH: value.deployment.ssh,
  });
}

async function readSettingsFile() {
  try {
    return normalizeSettings(JSON.parse(await readFile(settingsFile, "utf8")));
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

function readSettingsFileSync() {
  try {
    return normalizeSettings(JSON.parse(readFileSync(settingsFile, "utf8")));
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

async function readEnvFile() {
  try {
    return parseEnv(await readFile(envFile, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

function readEnvFileSync() {
  try {
    return parseEnv(readFileSync(envFile, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

function parseEnv(content) {
  const env = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(=|:)\s*(.*)$/);
    if (!match) continue;

    env[match[1]] = unquote(match[3].trim());
  }

  return env;
}

function envToSettings(env) {
  return {
    environment: {
      nodeLibrary: env.NODE_LIBRARY,
    },
    proxy: {
      npmUrl: env.NPM_URL,
      npmEmail: env.NPM_EMAIL,
      npmPassword: env.NPM_PASSWORD,
    },
    mariadb: {
      defaultVersion: env.MARIADB_VERSION,
      rootPassword: env.MYSQL_ROOT_PASSWORD,
      defaultDatabase: env.DB_NAME,
      dumpName: env.DUMP_NAME,
      homeDumpPath: env.HOME_DUMP_PATH,
      serverDumpPath: env.SERVER_DUMP_PATH,
    },
    deployment: {
      ssh: env.SSH,
      host: env.SERVER_HOST,
      port: env.SERVER_PORT,
      user: env.SERVER_USER,
      sshKey: env.SERVER_SSH_KEY,
    },
    registry: {
      registryUser: env.REGISTRY_USER,
      registryPassword: env.REGISTRY_PASSWORD,
      dockerhubUsername: env.DOCKERHUB_USERNAME,
      dockerhubPassword: env.DOCKERHUB_PASSWORD,
    },
    storage: {
      minioRootUser: env.MINIO_ROOT_USER,
      minioRootPassword: env.MINIO_ROOT_PASSWORD,
      redisPassword: env.REDIS_PASSWORD,
    },
    postgres: {
      user: env.POSTGRES_USER,
      password: env.POSTGRES_PASSWORD,
      database: env.POSTGRES_DB,
      dumpName: env.POSTGRES_DUMP_NAME,
      homeDumpPath: env.POSTGRES_HOME_DUMP_PATH,
      serverDumpPath: env.POSTGRES_SERVER_DUMP_PATH,
      pgAdminEmail: env.PGADMIN_EMAIL,
      pgAdminPassword: env.PGADMIN_PASSWORD,
    },
  };
}

function normalizeSettings(settings = {}) {
  return mergeSettings(defaultSettings, settings);
}

function mergeSettings(...sources) {
  const result = cloneSettings(defaultSettings);

  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    for (const [groupKey, groupValue] of Object.entries(source)) {
      if (!result[groupKey] || !groupValue || typeof groupValue !== "object") continue;

      for (const [fieldKey, fieldValue] of Object.entries(groupValue)) {
        if (!(fieldKey in result[groupKey])) continue;
        if (fieldValue === undefined || fieldValue === null) continue;
        result[groupKey][fieldKey] = String(fieldValue);
      }
    }
  }

  return result;
}

function cloneSettings(settings) {
  return JSON.parse(JSON.stringify(settings));
}

function dropEmptyValues(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}
