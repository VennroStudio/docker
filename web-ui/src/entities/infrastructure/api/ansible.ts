import { fetchJson, jsonRequestInit } from "@/shared/api";
import type { AnsibleState } from "../model/types";

export function fetchAnsible(signal?: AbortSignal): Promise<AnsibleState> {
  return fetchJson<AnsibleState>("/api/ansible", { signal }, "Ansible request failed");
}

export function updateAnsibleConfig(config: Record<string, boolean | null | number | string>): Promise<AnsibleState> {
  return fetchJson<AnsibleState>(
    "/api/ansible/config",
    jsonRequestInit("PUT", { config }),
    "Ansible config update failed",
  );
}

export function updateAnsiblePlaybook(playbook: string): Promise<AnsibleState> {
  return fetchJson<AnsibleState>(
    "/api/ansible/playbook",
    jsonRequestInit("PUT", { playbook }),
    "Ansible playbook update failed",
  );
}
