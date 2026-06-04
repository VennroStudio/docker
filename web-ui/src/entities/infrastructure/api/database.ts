import { fetchJson } from "@/shared/api";

export type DatabaseEngine = "mariadb" | "postgres";

export type DatabaseDumpFileInfo = {
  modifiedAt: string;
  name: string;
  path: string;
  size: number;
};

type DatabasesResponse = {
  databases: string[];
};

type DumpFilesResponse = {
  dumps: DatabaseDumpFileInfo[];
};

export async function fetchDatabaseNames(engine: DatabaseEngine, container: string): Promise<string[]> {
  const payload = await fetchJson<DatabasesResponse>(
    `/api/databases?engine=${engine}&container=${encodeURIComponent(container)}`,
    undefined,
    `${databaseEngineTitle(engine)} databases request failed`,
  );
  return payload.databases;
}

export async function fetchDatabaseDumps(engine: DatabaseEngine): Promise<DatabaseDumpFileInfo[]> {
  const payload = await fetchJson<DumpFilesResponse>(
    `/api/dumps?engine=${engine}`,
    undefined,
    `${databaseEngineTitle(engine)} dumps request failed`,
  );
  return payload.dumps;
}

function databaseEngineTitle(engine: DatabaseEngine) {
  return engine === "mariadb" ? "MariaDB" : "Postgres";
}
