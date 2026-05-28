#!/usr/bin/env node
import { containerStatus, printJson, settingsUrl } from "../common/status.mjs";

const minioContainer = "minio-container";

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const [command = "minio"] = process.argv.slice(2);

  if (command === "minio") return printJson(await minioStatus());

  throw new Error("Usage: node scripts/minio/status.mjs minio");
}

async function minioStatus() {
  return {
    ...(await containerStatus(minioContainer)),
    url: await settingsUrl("minio.minioUrl"),
  };
}
