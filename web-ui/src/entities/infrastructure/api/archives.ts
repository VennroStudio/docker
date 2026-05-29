import { fetchJson } from "@/shared/api";
import type { ArchiveFile } from "../model/types";

export type ArchivesResponse = {
  archives: ArchiveFile[];
};

export async function fetchArchives(signal?: AbortSignal) {
  return fetchJson<ArchivesResponse>("/api/archives", { signal }, "Archives request failed");
}
