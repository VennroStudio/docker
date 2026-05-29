import { fetchJson } from "@/shared/api";

type DatabasesResponse = {
  databases: string[];
};

export async function fetchPostgresDatabases(container: string): Promise<string[]> {
  const payload = await fetchJson<DatabasesResponse>(
    `/api/databases?engine=postgres&container=${encodeURIComponent(container)}`,
    undefined,
    "Postgres databases request failed",
  );
  return payload.databases;
}
