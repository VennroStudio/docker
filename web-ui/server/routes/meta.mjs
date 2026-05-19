import path from "node:path";
import { projectRoot } from "../config.mjs";
import { sendJson } from "../http.mjs";

export async function meta(_req, res) {
  sendJson(res, 200, {
    projectName: path.basename(projectRoot),
    projectRoot,
  });
}
