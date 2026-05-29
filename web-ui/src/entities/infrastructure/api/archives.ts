import type { ArchiveFile } from "../model/types";

export type ArchivesResponse = {
  archives: ArchiveFile[];
};

export async function fetchArchives(signal?: AbortSignal) {
  const response = await fetch("/api/archives", { signal });
  if (!response.ok) throw new Error(`Archives request failed: ${response.status}`);
  return (await response.json()) as ArchivesResponse;
}
