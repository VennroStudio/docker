import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const defaultSettingsFile = process.env.INFRA_DEFAULT_SETTINGS_FILE || "config/default-settings.json";
export const settingsFile = process.env.INFRA_SETTINGS_FILE || "config/settings.json";

export async function readSettings() {
  return deepMerge(await readJson(defaultSettingsFile), await readJson(settingsFile));
}

export async function writeSettings(payload, file = settingsFile) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return {};
  }
}

export function settingsValue(settings, key) {
  return key.split(".").reduce((value, part) => value?.[part], settings) || "";
}

export function deepMerge(base, override) {
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
