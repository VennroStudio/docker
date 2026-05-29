import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function archives(_req, res) {
  sendJson(res, 200, JSON.parse(await execMake(["archive-list"])));
}
