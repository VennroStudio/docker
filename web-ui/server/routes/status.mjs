import { serviceContainers } from "../config.mjs";
import { getDockerStatuses } from "../docker-status.mjs";
import { sendJson } from "../http.mjs";
import { readMariaDbInstances } from "../mariadb-instances.mjs";
import { readPostgresInstances } from "../postgres-instances.mjs";

export async function status(_req, res) {
  sendJson(res, 200, await getDockerStatuses(buildServiceTargets()));
}

function buildServiceTargets() {
  const mariaDbContainers = safeReadContainers(readMariaDbInstances);
  const postgresContainers = safeReadContainers(readPostgresInstances);

  return {
    ...serviceContainers,
    mariadb: unique([
      ...(serviceContainers.mariadb || []),
      ...mariaDbContainers,
      ...postgresContainers,
      ...(postgresContainers.length > 0 ? ["pgadmin-container"] : []),
    ]),
    postgres: unique([...(serviceContainers.postgres || []), ...postgresContainers, "pgadmin-container"]),
  };
}

function safeReadContainers(readInstances) {
  try {
    return readInstances()
      .map((instance) => instance.container)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function unique(values) {
  return [...new Set(values)];
}
