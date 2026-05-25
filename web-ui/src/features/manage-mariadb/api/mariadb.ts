import type { MariaDbInstance, PhpMyAdminOverview } from "@/entities/infrastructure";

export type MariaDbOverview = {
  instances: MariaDbInstance[];
  phpmyadmin: PhpMyAdminOverview;
};

export async function getMariaDbOverview(): Promise<MariaDbOverview> {
  const response = await fetch("/api/mariadb/instances");

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as MariaDbOverview;
}
