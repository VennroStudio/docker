import { execFile } from "node:child_process";
import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function projectsOverview(_req, res) {
  const [projects, catalog] = await Promise.all([listProjects(), runtimeCatalog()]);
  sendJson(res, 200, { catalog, projects });
}

export async function listProjects() {
  const projects = parseJson(await execMake(["project-list"]), []);
  return Promise.all(projects.map((project) => enrichProject(project)));
}

export async function runtimeCatalog() {
  return parseJson(await execMake(["project-catalog"]), {});
}

async function enrichProject(project) {
  const containers = await Promise.all(projectContainerNames(project).map((container) => inspectContainer(container)));
  const running = containers.filter((container) => container.state === "running").length;

  return {
    ...project,
    containers,
    state: projectState(running, containers),
  };
}

function projectContainerNames(project) {
  return [`${project.name}-container`];
}

async function inspectContainer(container) {
  try {
    const output = await execFileText("docker", [
      "inspect",
      "--format",
      "{{.State.Status}}|{{.State.Running}}|{{.State.Error}}",
      container,
    ]);
    const [status, running, error] = output.trim().split("|");
    return {
      container,
      state: running === "true" ? "running" : normalizeState(status),
      status,
      ...(error ? { error } : {}),
    };
  } catch {
    return {
      container,
      state: "missing",
    };
  }
}

function projectState(running, containers) {
  const webRunning = containers.filter((container) => container.state === "running").length;
  const existing = containers.filter((container) => container.state !== "missing").length;

  if (containers.length === 0 || existing === 0) return "missing";
  if (webRunning === containers.length) return "running";
  if (running > 0) return "partial";
  return "stopped";
}

function normalizeState(state) {
  const known = new Set(["created", "dead", "exited", "paused", "removing", "restarting", "running"]);
  if (known.has(state)) return state;
  if (state === "stopped") return "stopped";
  return "unknown";
}

function parseJson(output, fallback) {
  try {
    return JSON.parse(output);
  } catch {
    return fallback;
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
