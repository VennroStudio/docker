import type { SshQuickCommand, SshServer } from "../model/types";
import { fetchJson } from "@/shared/api";

export type SshServersResponse = {
  commands: SshQuickCommand[];
  servers: SshServer[];
};

export function fetchSshServers(signal?: AbortSignal): Promise<SshServersResponse> {
  return fetchJson<SshServersResponse>("/api/ssh/servers", { signal }, "SSH servers request failed");
}
