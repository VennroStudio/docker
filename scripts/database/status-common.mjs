import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

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

export async function serviceLink(container, fallback) {
  const registry = await readServiceLinks();
  const binding = registry.bindings.find((item) => item.container === container);

  if (!binding?.domain) return fallback;

  return {
    domain: binding.domain,
    label: binding.domain,
    port: binding.port,
    source: "domain",
    url: `${binding.scheme || "http"}://${binding.domain}`,
  };
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

async function readServiceLinks() {
  const linksFile = path.resolve(process.env.SERVICE_LINKS_FILE || "docker/services/links.json");

  try {
    const payload = JSON.parse(await readFile(linksFile, "utf8"));
    return { bindings: Array.isArray(payload.bindings) ? payload.bindings : [] };
  } catch {
    return { bindings: [] };
  }
}
