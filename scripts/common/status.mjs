import { parseArgs, printJson } from "./cli.mjs";
import { execFileText } from "./process.mjs";
import { readSettings, settingsValue } from "./settings.mjs";

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

export { parseArgs, printJson };

export async function settingsUrl(path) {
  return settingsValue(await readSettings(), path);
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
