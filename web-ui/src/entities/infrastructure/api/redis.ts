import { fetchJson } from "@/shared/api";
import type { ContainerRuntimeState } from "../model/types";

export type RedisRuntimeInfo = {
  container: string;
  running: boolean;
  state: ContainerRuntimeState;
  status: string;
  uptime: string;
  url?: string;
};

export type RedisStatusResponse = {
  redis: RedisRuntimeInfo;
  redisinsight: RedisRuntimeInfo;
};

export async function fetchRedisStatus(signal?: AbortSignal) {
  return fetchJson<RedisStatusResponse>("/api/redis/status", { signal }, "Redis status request failed");
}
