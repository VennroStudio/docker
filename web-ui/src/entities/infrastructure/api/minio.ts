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
  const response = await fetch("/api/minio/status", { signal });
  if (!response.ok) throw new Error(`MinIO status request failed: ${response.status}`);
  return (await response.json()) as MinioStatusResponse;
}
