import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function nginxStatus(_req, res) {
  const output = await execMake(["npm-status"]);
  sendJson(res, 200, JSON.parse(output));
}
