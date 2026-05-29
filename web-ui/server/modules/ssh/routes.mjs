import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function sshServers(_req, res) {
  sendJson(res, 200, JSON.parse(await execMake(["ssh-list"])));
}
