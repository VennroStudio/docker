import { fetchJson } from "@/shared/api";
import type { ContainerRuntimeState } from "../model/types";

export type MinioStatusResponse = {
  container: string;
  running: boolean;
  state: ContainerRuntimeState;
  status: string;
  uptime: string;
  url?: string;
};

export async function fetchMinioStatus(signal?: AbortSignal) {
  return fetchJson<MinioStatusResponse>("/api/minio/status", { signal }, "MinIO status request failed");
}
