import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function redisStatus(_req, res) {
  const [redis, redisinsight] = await Promise.all([execMake(["redis-status"]), execMake(["redisinsight-status"])]);

  sendJson(res, 200, {
    redis: JSON.parse(redis),
    redisinsight: JSON.parse(redisinsight),
  });
}
