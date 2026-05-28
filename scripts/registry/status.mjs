#!/usr/bin/env node
import { containerStatus, printJson, settingsUrl } from "../common/status.mjs";

const registryContainer = "registry-container";
const registryUiContainer = "registry-ui-container";

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const [command = "overview"] = process.argv.slice(2);

  if (command === "overview") return printJson(await overview());
  if (command === "registry") return printJson(await registryStatus());
  if (command === "registry-ui") return printJson(await registryUiStatus());

  throw new Error("Usage: node scripts/registry/status.mjs overview|registry|registry-ui");
}

async function overview() {
  return {
    registry: await registryStatus(),
    registryUi: await registryUiStatus(),
  };
}

async function registryStatus() {
  return {
    ...(await containerStatus(registryContainer)),
    url: await settingsUrl("registry.registryUrl"),
  };
}

async function registryUiStatus() {
  return {
    ...(await containerStatus(registryUiContainer)),
    url: await settingsUrl("registry.registryUiUrl"),
  };
}
