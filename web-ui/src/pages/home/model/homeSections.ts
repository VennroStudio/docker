import type { HomeCardViewId } from "@/entities/infrastructure";

export type HomeService = {
  id: HomeCardViewId;
};

export const homeModules: HomeService[] = [
  { id: "proxy" },
  { id: "mariadb" },
  { id: "redis" },
  { id: "rustfs" },
  { id: "registry" },
];

export const homeServices: HomeService[] = [{ id: "ssh" }, { id: "ansible" }, { id: "utilities" }];
