import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";

export async function containerStatus(container) {
  const item = await dockerContainer(container);

  if (!item) {
    return {
      container,
      running: false,
      state: "missing",
      status: "not created",
      uptime: "not created",
    };
  }

  const state = String(item.State || "").toLowerCase() || "unknown";
  const status = String(item.Status || "");

  return {
    container,
    running: state === "running",
    state,
    status,
    uptime: status || "unknown",
  };
}

export function parseArgs(args) {
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = args[index + 1];

    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return options;
}

export function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

export async function settingsUrl(path) {
  return getByPath(await readSettings(), path);
}

async function dockerContainer(container) {
  const output = await execFileText("docker", [
    "ps",
    "-a",
    "--filter",
    `name=^/${container}$`,
    "--format",
    "{{json .}}",
  ]);

  const line = output
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)[0];

  if (!line) return null;

  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function execFileText(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { encoding: "utf8" }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || stdout || error.message));
      else resolve(stdout);
    });
  });
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

function getByPath(source, key) {
  return key.split(".").reduce((value, part) => value?.[part], source) || "";
}
