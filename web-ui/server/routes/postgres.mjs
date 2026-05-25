import { getContainerStates } from "../docker-status.mjs";
import { sendJson } from "../http.mjs";
import { readPostgresInstances } from "../postgres-instances.mjs";

export async function postgresInstances(_req, res) {
  const instances = readPostgresInstances();
  const states = await getContainerStates([...instances.map((instance) => instance.container), "pgadmin-container"]);

  sendJson(res, 200, {
    instances: instances.map((instance) => publicInstance(instance, states.get(instance.container))),
    pgadmin: {
      container: "pgadmin-container",
      state: states.get("pgadmin-container")?.state || "unknown",
      status: states.get("pgadmin-container")?.status,
    },
  });
}

function publicInstance(instance, containerState) {
  return {
    composeFile: instance.composeFile,
    container: instance.container,
    database: instance.database,
    existing: instance.existing,
    hostPort: instance.hostPort,
    name: instance.name,
    state: containerState?.state || "unknown",
    status: containerState?.status,
    user: instance.user,
    version: instance.version,
    volume: instance.volume,
  };
}
