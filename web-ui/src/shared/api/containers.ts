import type { ContainerRuntimeState } from "../types/commands";

export type ContainerStateInfo = {
  error?: string;
  state: ContainerRuntimeState;
  status?: string;
};

export async function fetchContainerStates(names: string[], signal?: AbortSignal) {
  if (names.length === 0) return {};

  const params = new URLSearchParams({ names: names.join(",") });
  const response = await fetch(`/api/containers?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const payload = (await response.json()) as { containers: Record<string, ContainerStateInfo> };
  return payload.containers;
}
