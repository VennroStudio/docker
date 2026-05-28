#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const authDir = "docker/registry/auth";
const authFile = path.join(authDir, "htpasswd");

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const settings = await readSettings();
  const user = process.env.REGISTRY_USER || settings.registry?.registryUser || "";
  const password = process.env.REGISTRY_PASSWORD || settings.registry?.registryPassword || "";

  if (!user) throw new Error("REGISTRY_USER is required. Set registry.registryUser in config/settings.json");
  if (!password) throw new Error("REGISTRY_PASSWORD is required. Set registry.registryPassword in config/settings.json");

  await mkdir(authDir, { recursive: true });
  const output = await execFileText("docker", [
    "run",
    "--rm",
    "httpd:2.4-alpine",
    "htpasswd",
    "-Bbn",
    user,
    password,
  ]);
  await writeFile(authFile, output, "utf8");
  console.log(`Generated ${authFile}`);
}

async function readSettings() {
  const defaults = await readJson("config/default-settings.json");
  const settings = await readJson(process.env.INFRA_SETTINGS_FILE || "config/settings.json");
  return deepMerge(defaults, settings);
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return {};
  }
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

function execFileText(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { encoding: "utf8" }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || stdout || error.message));
      else resolve(stdout);
    });
  });
}
