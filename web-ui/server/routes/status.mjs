import { getDockerStatuses } from "../docker-status.mjs";
import { sendJson } from "../http.mjs";

export async function status(_req, res) {
  sendJson(res, 200, await getDockerStatuses());
}
