import { fetchJson } from "@/shared/api";

export type MariaDbDumpFile = {
  modifiedAt: string;
  name: string;
  path: string;
  size: number;
};

type DumpFilesResponse = {
  dumps: MariaDbDumpFile[];
};

export async function fetchMariaDbDumps(): Promise<MariaDbDumpFile[]> {
  const payload = await fetchJson<DumpFilesResponse>(
    "/api/dumps?engine=mariadb",
    undefined,
    "MariaDB dumps request failed",
  );
  return payload.dumps;
}
