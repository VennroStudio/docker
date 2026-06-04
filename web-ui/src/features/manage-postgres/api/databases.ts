import { fetchDatabaseNames } from "@/entities/infrastructure";

export async function fetchPostgresDatabases(container: string): Promise<string[]> {
  return fetchDatabaseNames("postgres", container);
}
