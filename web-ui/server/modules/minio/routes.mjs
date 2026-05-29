import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function minioStatus(_req, res) {
  sendJson(res, 200, JSON.parse(await execMake(["minio-status"])));
}
