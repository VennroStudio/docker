import { fetchJson } from "@/shared/api";

type DatabasesResponse = {
  databases: string[];
};

export async function fetchMariaDbDatabases(container: string): Promise<string[]> {
  const payload = await fetchJson<DatabasesResponse>(
    `/api/databases?engine=mariadb&container=${encodeURIComponent(container)}`,
    undefined,
    "MariaDB databases request failed",
  );
  return payload.databases;
}
