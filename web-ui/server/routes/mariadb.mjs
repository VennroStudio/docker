import { getContainerStates } from "../docker-status.mjs";
import { readMariaDbInstances } from "../mariadb-instances.mjs";
import { sendJson } from "../http.mjs";

export async function mariadbInstances(_req, res) {
  const instances = readMariaDbInstances();
  const states = await getContainerStates([...instances.map((instance) => instance.container), "phpmyadmin-container"]);

  sendJson(res, 200, {
    instances: instances.map((instance) => publicInstance(instance, states.get(instance.container))),
    phpmyadmin: {
      container: "phpmyadmin-container",
      state: states.get("phpmyadmin-container")?.state || "unknown",
      status: states.get("phpmyadmin-container")?.status,
    },
  });
}

function publicInstance(instance, containerState) {
  return {
    authMode: instance.authMode,
    composeFile: instance.composeFile,
    container: instance.container,
    existing: instance.existing,
    hostPort: instance.hostPort,
    name: instance.name,
    state: containerState?.state || "unknown",
    status: containerState?.status,
    version: instance.version,
    volume: instance.volume,
  };
}
