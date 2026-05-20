import { readFile } from "node:fs/promises";
import path from "node:path";
import { projectRoot } from "./config.mjs";

const linksFile = path.resolve(projectRoot, process.env.SERVICE_LINKS_FILE || "docker/services/links.json");

const defaultLinks = {
  "minio-container": {
    label: "MinIO console",
    port: 3901,
    source: "local",
    url: "http://localhost:3901",
  },
  "nginx-container": {
    label: "NPM",
    port: 81,
    source: "local",
    url: "http://localhost:81",
  },
  "pgadmin-container": {
    label: "pgAdmin",
    port: 5050,
    source: "local",
    url: "http://localhost:5050",
  },
  "redisinsight-container": {
    label: "RedisInsight",
    port: 5540,
    source: "local",
    url: "http://localhost:5540",
  },
  "registry-ui-container": {
    label: "Registry UI",
    port: 5081,
    source: "local",
    url: "http://localhost:5081",
  },
};

export async function getServiceLinks() {
  const registry = await readServiceLinks();
  const links = { ...defaultLinks };

  for (const binding of registry.bindings) {
    if (!binding.container || !binding.domain) continue;

    links[binding.container] = {
      domain: binding.domain,
      label: binding.domain,
      port: binding.port,
      source: "domain",
      url: `${binding.scheme || "http"}://${binding.domain}`,
    };
  }

  return {
    bindings: registry.bindings,
    links,
  };
}

async function readServiceLinks() {
  try {
    const payload = JSON.parse(await readFile(linksFile, "utf8"));
    return { bindings: Array.isArray(payload.bindings) ? payload.bindings : [] };
  } catch {
    return { bindings: [] };
  }
}
