import { fetchDatabaseNames } from "@/entities/infrastructure";

export async function fetchMariaDbDatabases(container: string): Promise<string[]> {
  return fetchDatabaseNames("mariadb", container);
}
