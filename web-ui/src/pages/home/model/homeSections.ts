import type { ServiceViewId } from "@/entities/infrastructure";

export type HomeService = {
  id: ServiceViewId;
};

export const homeModules: HomeService[] = [
  { id: "proxy" },
  { id: "mariadb" },
  { id: "projects" },
  { id: "redis" },
  { id: "minio" },
  { id: "registry" },
];

export const homeServices: HomeService[] = [{ id: "ssh" }];
