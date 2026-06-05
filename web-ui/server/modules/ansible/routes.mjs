import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { body, sendJson, assert } from "../../http.mjs";
import { projectRoot } from "../../config.mjs";

const ansibleConfigFile = path.join(projectRoot, "config/ansible.json");
const deployPlaybookFile = path.join(projectRoot, "docker/ansible/deploy.yml");

export async function ansible(req, res) {
  if (req.method === "GET") {
    return sendJson(res, 200, await readAnsibleState());
  }

  sendJson(res, 405, { ok: false, output: "Method not allowed" });
}

export async function ansibleConfig(req, res) {
  if (req.method !== "PUT") return sendJson(res, 405, { ok: false, output: "Method not allowed" });

  const payload = await body(req);
  validateConfig(payload.config);
  await readRequiredFile(ansibleConfigFile, "Ansible config");
  await writeFile(ansibleConfigFile, `${JSON.stringify(payload.config, null, 2)}\n`, "utf8");
  sendJson(res, 200, await readAnsibleState());
}

export async function ansiblePlaybook(req, res) {
  if (req.method !== "PUT") return sendJson(res, 405, { ok: false, output: "Method not allowed" });

  const payload = await body(req);
  assert(typeof payload.playbook === "string" && payload.playbook.trim(), "Playbook is required");
  await writeFile(
    deployPlaybookFile,
    payload.playbook.endsWith("\n") ? payload.playbook : `${payload.playbook}\n`,
    "utf8",
  );
  sendJson(res, 200, await readAnsibleState());
}

async function readAnsibleState() {
  const config = await readOptionalConfig();

  return {
    config: config.payload,
    configExists: config.exists,
    configError: config.error,
    configPath: ansibleConfigFile,
    playbook: await readRequiredFile(deployPlaybookFile, "Ansible deploy playbook"),
    playbookPath: deployPlaybookFile,
  };
}

async function readOptionalConfig() {
  try {
    return {
      exists: true,
      payload: JSON.parse(await readFile(ansibleConfigFile, "utf8")),
    };
  } catch (error) {
    if (error instanceof SyntaxError) throw error;

    return {
      error: `Ansible config is missing: ${ansibleConfigFile}. Run make init.`,
      exists: false,
      payload: {},
    };
  }
}

async function readRequiredFile(file, label) {
  try {
    return await readFile(file, "utf8");
  } catch {
    throw new Error(`${label} is missing: ${file}. Run make init.`);
  }
}

function validateConfig(config) {
  assert(isPlainObject(config), "Ansible config must be a JSON object");

  for (const [key, value] of Object.entries(config)) {
    assert(/^[A-Za-z_][A-Za-z0-9_]*$/.test(key), `Invalid Ansible variable name: ${key}`);
    assert(
      value === null || ["boolean", "number", "string"].includes(typeof value),
      `Invalid value for ${key}: use string, number, boolean or null`,
    );
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
