import { getContainerStates } from "../docker-status.mjs";
import { sendJson } from "../http.mjs";

export async function containers(req, res) {
  const url = new URL(req.url, "http://localhost");
  const names = (url.searchParams.get("names") || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  const states = await getContainerStates([...new Set(names)]);
  sendJson(res, 200, { containers: Object.fromEntries(states) });
}
