import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function sshServers(_req, res) {
  const [serversPayload, commandsPayload] = await Promise.all([execMake(["ssh-list"]), execMake(["ssh-command-list"])]);

  sendJson(res, 200, {
    ...JSON.parse(serversPayload),
    ...JSON.parse(commandsPayload),
  });
}
