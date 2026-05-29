import { fetchJson } from "@/shared/api";
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
  return fetchJson<RegistryStatusResponse>("/api/registry/status", { signal }, "Registry status request failed");
}
