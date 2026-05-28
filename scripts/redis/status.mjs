#!/usr/bin/env node
import { containerStatus, printJson, settingsUrl } from "../common/status.mjs";

const redisContainer = "redis-container";
const redisInsightContainer = "redisinsight-container";

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const [command = "overview"] = process.argv.slice(2);

  if (command === "overview") return printJson(await overview());
  if (command === "redis") return printJson(await redisStatus());
  if (command === "redisinsight") return printJson(await redisInsightStatus());

  throw new Error("Usage: node scripts/redis/status.mjs overview|redis|redisinsight");
}

async function overview() {
  return {
    redis: await redisStatus(),
    redisinsight: await redisInsightStatus(),
  };
}

async function redisStatus() {
  return containerStatus(redisContainer);
}

async function redisInsightStatus() {
  return {
    ...(await containerStatus(redisInsightContainer)),
    url: await settingsUrl("redisinsight.riUrl"),
  };
}
