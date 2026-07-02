#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  deepMerge,
  defaultSettingsFile as defaultsFile,
  settingsFile,
} from "../common/settings.mjs";

const command = process.argv[2];

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
  if (path.resolve(file) === path.resolve(settingsFile) && !existsSync(settingsFile)) {
    throw new Error(`Settings file is missing: ${settingsFile}. Run make init.`);
  }

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
  const registryPort = normalizePort(source.registry?.registryPort, "5051");
  const registryUiPort = normalizePort(source.registry?.registryUiPort, "5081");

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
    rustfs: {
      rustfsUrl: source.rustfs?.rustfsUrl || "http://localhost:3901/rustfs/console/",
      rustfsAccessKey: source.rustfs?.rustfsAccessKey || "rustfsadmin",
      rustfsSecretKey: source.rustfs?.rustfsSecretKey || "rustfsadmin",
    },
    registry: {
      registryPort,
      registryUiPort,
      registryUrl: localUrlForPort(source.registry?.registryUrl, registryPort),
      registryUiUrl: localUrlForPort(source.registry?.registryUiUrl, registryUiPort),
      registryUser: source.registry?.registryUser || "",
      registryPassword: source.registry?.registryPassword || "",
    },
  };
}

function envEntries(settings) {
  return [
    ["PGADMIN_EMAIL", settings.pgadmin?.pgaEmail],
    ["PGADMIN_PASSWORD", settings.pgadmin?.pgaPassword],
    ["REDIS_PASSWORD", settings.redis?.redisPassword],
    ["RUSTFS_ACCESS_KEY", settings.rustfs?.rustfsAccessKey],
    ["RUSTFS_SECRET_KEY", settings.rustfs?.rustfsSecretKey],
    ["RUSTFS_CONSOLE_ENABLE", "true"],
    ["REGISTRY_PORT", settings.registry?.registryPort],
    ["REGISTRY_UI_PORT", settings.registry?.registryUiPort],
    ["REGISTRY_USER", settings.registry?.registryUser],
    ["REGISTRY_PASSWORD", settings.registry?.registryPassword],
  ];
}

function localUrlForPort(value, port) {
  if (!value) return `http://localhost:${port}`;

  try {
    const url = new URL(value);
    if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) return value;

    url.port = String(port);
    return url.toString().replace(/\/$/, "");
  } catch {
    return `http://localhost:${port}`;
  }
}

function normalizePort(value, fallback) {
  const port = String(value || fallback).trim();
  const parsed = Number(port);

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 65535 ? String(parsed) : fallback;
}

function usage(code) {
  console.log("Usage:");
  console.log("  node scripts/config/settings.mjs init");
  console.log("  node scripts/config/settings.mjs show");
  console.log("  node scripts/config/settings.mjs env");
  console.log("  KEY=proxy.npmEmail VALUE=user@example.com node scripts/config/settings.mjs set");
  process.exit(code);
}
