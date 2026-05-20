import { getServiceLinks } from "../service-links.mjs";
import { sendJson } from "../http.mjs";

export async function links(_req, res) {
  sendJson(res, 200, await getServiceLinks());
}
