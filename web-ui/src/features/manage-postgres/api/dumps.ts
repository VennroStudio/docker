import { fetchDatabaseDumps, type DatabaseDumpFileInfo } from "@/entities/infrastructure";

export type PostgresDumpFile = DatabaseDumpFileInfo;

export async function fetchPostgresDumps(): Promise<PostgresDumpFile[]> {
  return fetchDatabaseDumps("postgres");
}
