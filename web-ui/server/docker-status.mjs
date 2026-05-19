import { execFile } from "node:child_process";
import { serviceContainers } from "./config.mjs";

export async function getDockerStatuses() {
  const result = await listDockerContainers();

  return {
    error: result.error,
    services: Object.entries(serviceContainers).map(([id, names]) => {
      if (result.error) {
        return {
          error: result.error,
          id,
          running: 0,
          state: "unknown",
          total: names.length,
        };
      }

      const running = names.filter((name) => result.containers.get(name)?.state === "running").length;
      const existing = names.filter((name) => result.containers.has(name)).length;

      return {
        id,
        running,
        state: serviceState(running, existing, names.length),
        total: names.length,
      };
    }),
  };
}

async function listDockerContainers() {
  try {
    const output = await execFileText("docker", ["ps", "-a", "--format", "{{json .}}"]);
    const containers = new Map();

    for (const line of output.split("\n").filter(Boolean)) {
      const item = parseDockerLine(line);
      if (!item) continue;

      const names = String(item.Names || "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);

      for (const name of names) {
        containers.set(name, {
          state: String(item.State || "").toLowerCase(),
          status: String(item.Status || ""),
        });
      }
    }

    return { containers };
  } catch (error) {
    return {
      containers: new Map(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function parseDockerLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function serviceState(running, existing, total) {
  if (running === total) return "running";
  if (running > 0) return "partial";
  if (existing > 0) return "stopped";
  return "missing";
}

function execFileText(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { encoding: "utf8" }, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}
