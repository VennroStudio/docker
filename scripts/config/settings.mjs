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

function readArg(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
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
  return normalizeSettings(JSON.parse(await readFile(file, "utf8")));
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
  if (!settings || typeof settings !== "object") return settings;
  if (!settings.proxy || typeof settings.proxy !== "object") return settings;

  return {
    ...settings,
    proxy: {
      ...settings.proxy,
    },
  };
}

function usage(code) {
  console.log("Usage:");
  console.log("  node scripts/config/settings.mjs init");
  console.log("  node scripts/config/settings.mjs show");
  console.log("  KEY=proxy.npmEmail VALUE=user@example.com node scripts/config/settings.mjs set");
  process.exit(code);
}
