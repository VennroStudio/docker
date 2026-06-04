import { fetchDatabaseDumps, type DatabaseDumpFileInfo } from "@/entities/infrastructure";

export type MariaDbDumpFile = DatabaseDumpFileInfo;

export async function fetchMariaDbDumps(): Promise<MariaDbDumpFile[]> {
  return fetchDatabaseDumps("mariadb");
}
