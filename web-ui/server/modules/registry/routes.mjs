import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function registryStatus(_req, res) {
  const [registry, registryUi] = await Promise.all([execMake(["registry-status"]), execMake(["registry-ui-status"])]);

  sendJson(res, 200, {
    registry: JSON.parse(registry),
    registryUi: JSON.parse(registryUi),
  });
}
