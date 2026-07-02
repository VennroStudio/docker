import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function rustfsStatus(_req, res) {
  sendJson(res, 200, JSON.parse(await execMake(["rustfs-status"])));
}
