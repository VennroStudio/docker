import type { PgAdminOverview, PostgresInstance } from "@/entities/infrastructure";
import { fetchJson } from "@/shared/api";

export type PostgresOverview = {
  instances: PostgresInstance[];
  pgadmin: PgAdminOverview;
};

export async function getPostgresOverview(): Promise<PostgresOverview> {
  return fetchJson<PostgresOverview>("/api/postgres/instances", undefined, "Postgres overview request failed");
}
