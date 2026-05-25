import type { PgAdminOverview, PostgresInstance } from "@/entities/infrastructure";

export type PostgresOverview = {
  instances: PostgresInstance[];
  pgadmin: PgAdminOverview;
};

export async function getPostgresOverview(): Promise<PostgresOverview> {
  const response = await fetch("/api/postgres/instances");

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as PostgresOverview;
}
