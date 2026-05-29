import { fetchJson } from "@/shared/api";

export type PostgresDumpFile = {
  modifiedAt: string;
  name: string;
  path: string;
  size: number;
};

type DumpFilesResponse = {
  dumps: PostgresDumpFile[];
};

export async function fetchPostgresDumps(): Promise<PostgresDumpFile[]> {
  const payload = await fetchJson<DumpFilesResponse>(
    "/api/dumps?engine=postgres",
    undefined,
    "Postgres dumps request failed",
  );
  return payload.dumps;
}
