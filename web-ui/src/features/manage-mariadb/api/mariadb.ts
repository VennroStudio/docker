import type { MariaDbInstance, PhpMyAdminOverview } from "@/entities/infrastructure";
import { fetchJson } from "@/shared/api";

export type MariaDbOverview = {
  instances: MariaDbInstance[];
  phpmyadmin: PhpMyAdminOverview;
};

export async function getMariaDbOverview(): Promise<MariaDbOverview> {
  return fetchJson<MariaDbOverview>("/api/mariadb/instances", undefined, "MariaDB overview request failed");
}
