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
  const response = await fetch("/api/redis/status", { signal });
  if (!response.ok) throw new Error(`Redis status request failed: ${response.status}`);
  return (await response.json()) as RedisStatusResponse;
}
