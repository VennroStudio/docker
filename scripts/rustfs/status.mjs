#!/usr/bin/env node
import { containerStatus, printJson, settingsUrl } from "../common/status.mjs";

const rustfsContainer = "rustfs-container";

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const [command = "rustfs"] = process.argv.slice(2);

  if (command === "rustfs") return printJson(await rustfsStatus());

  throw new Error("Usage: node scripts/rustfs/status.mjs rustfs");
}

async function rustfsStatus() {
  return {
    ...(await containerStatus(rustfsContainer)),
    url: await settingsUrl("rustfs.rustfsUrl"),
  };
}
