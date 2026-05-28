import type { ContainerRuntimeState } from "../model/types";

export type RegistryRuntimeInfo = {
  container: string;
  running: boolean;
  state: ContainerRuntimeState;
  status: string;
  uptime: string;
  url?: string;
};

export type RegistryStatusResponse = {
  registry: RegistryRuntimeInfo;
  registryUi: RegistryRuntimeInfo;
};

export async function fetchRegistryStatus(signal?: AbortSignal) {
  const response = await fetch("/api/registry/status", { signal });
  if (!response.ok) throw new Error(`Registry status request failed: ${response.status}`);
  return (await response.json()) as RegistryStatusResponse;
}
