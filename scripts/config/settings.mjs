#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const command = process.argv[2];
const settingsFile = process.env.INFRA_SETTINGS_FILE || "config/settings.json";
const defaultsFile = process.env.INFRA_DEFAULT_SETTINGS_FILE || "config/default-settings.json";

try {
  if (command === "init") await initSettings();
  else if (command === "show") await showSettings();
  else if (command === "set") await setSetting();
  else if (command === "env") await generateEnv();
  else usage(1);
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}

async function initSettings() {
  if (existsSync(settingsFile)) {
    await migrateSettings();
    console.log(`Settings already exists: ${settingsFile}`);
    return;
  }

  const defaults = await readJson(defaultsFile);
  await writeJson(settingsFile, defaults);
  console.log(`Created settings: ${settingsFile}`);
}

async function showSettings() {
  const settings = await readJson(settingsFile);
  await writeJson(settingsFile, settings);
  console.log(JSON.stringify(settings, null, 2));
}

async function setSetting() {
  const key = readArg("KEY");
  const value = readArg("VALUE");
  const settings = await readJson(settingsFile);
  setByPath(settings, key, value);
  await writeJson(settingsFile, settings);
  console.log(`Updated ${key}`);
}

async function generateEnv() {
  const settings = await readJson(settingsFile);
  const lines = envEntries(settings)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${String(value).replace(/\n/g, "")}`);

  await writeFile(".env", `${lines.join("\n")}\n`, "utf8");
  console.log("Generated .env from config/settings.json");
}

function readArg(name) {
  const value = process.env[name];
  if (!(name in process.env)) throw new Error(`${name} is required`);
  return value;
}

function setByPath(target, key, value) {
  const parts = key.split(".").filter(Boolean);
  if (!parts.length) throw new Error("KEY is invalid");

  let current = target;
  for (const part of parts.slice(0, -1)) {
    if (!current[part] || typeof current[part] !== "object" || Array.isArray(current[part])) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts.at(-1)] = value;
}

async function readJson(file) {
  const payload = JSON.parse(await readFile(file, "utf8"));
  if (path.resolve(file) === path.resolve(defaultsFile) || !existsSync(defaultsFile)) {
    return normalizeSettings(payload);
  }

  const defaults = JSON.parse(await readFile(defaultsFile, "utf8"));
  return normalizeSettings(deepMerge(defaults, payload));
}

async function writeJson(file, payload) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(normalizeSettings(payload), null, 2)}\n`, "utf8");
}

async function migrateSettings() {
  const settings = await readJson(settingsFile);
  await writeJson(settingsFile, settings);
}

function normalizeSettings(settings = {}) {
  const source = settings && typeof settings === "object" ? settings : {};

  return {
    proxy: {
      npmUrl: source.proxy?.npmUrl || "http://localhost:81",
      npmEmail: source.proxy?.npmEmail || "",
      npmPassword: source.proxy?.npmPassword || "",
    },
    phpmyadmin: {
      pmaUrl: source.phpmyadmin?.pmaUrl || "http://localhost:8080",
    },
    pgadmin: {
      pgaUrl: source.pgadmin?.pgaUrl || "http://localhost:5050",
      pgaEmail: source.pgadmin?.pgaEmail || "admin@example.com",
      pgaPassword: source.pgadmin?.pgaPassword || "admin",
    },
    redis: {
      redisPassword: source.redis?.redisPassword || "redis",
    },
    redisinsight: {
      riUrl: source.redisinsight?.riUrl || "http://localhost:5540",
    },
    minio: {
      minioUrl: source.minio?.minioUrl || "http://localhost:3901",
      minioRootUser: source.minio?.minioRootUser || "minio",
      minioRootPassword: source.minio?.minioRootPassword || "minioadmin",
    },
  };
}

function deepMerge(base, override) {
  if (!isPlainObject(base)) return override;
  if (!isPlainObject(override)) return base;

  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = isPlainObject(value) ? deepMerge(base[key], value) : value;
  }
  return result;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function envEntries(settings) {
  return [
    ["PGADMIN_EMAIL", settings.pgadmin?.pgaEmail],
    ["PGADMIN_PASSWORD", settings.pgadmin?.pgaPassword],
    ["REDIS_PASSWORD", settings.redis?.redisPassword],
    ["MINIO_ROOT_USER", settings.minio?.minioRootUser],
    ["MINIO_ROOT_PASSWORD", settings.minio?.minioRootPassword],
  ];
}

function usage(code) {
  console.log("Usage:");
  console.log("  node scripts/config/settings.mjs init");
  console.log("  node scripts/config/settings.mjs show");
  console.log("  node scripts/config/settings.mjs env");
  console.log("  KEY=proxy.npmEmail VALUE=user@example.com node scripts/config/settings.mjs set");
  process.exit(code);
}
