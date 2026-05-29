#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileText } from "../common/process.mjs";
import { readSettings } from "../common/settings.mjs";

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
