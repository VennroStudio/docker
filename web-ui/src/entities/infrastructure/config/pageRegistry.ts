import { mariadbActions, minioActions, postgresActions, redisActions, registryActions } from "./actions";
import { serviceShells } from "./shells";
import type { CommandAction, ShellAction, ViewId } from "../model/types";

export type CommandPageId = Exclude<ViewId, "home" | "proxy" | "settings" | "ssh">;

export const commandPageRegistry: Record<CommandPageId, { actions: CommandAction[]; shells?: ShellAction[] }> = {
  mariadb: { actions: mariadbActions, shells: serviceShells.mariadb },
  minio: { actions: minioActions, shells: serviceShells.minio },
  nginx: { actions: [], shells: serviceShells.nginx },
  postgres: { actions: postgresActions, shells: serviceShells.postgres },
  projects: { actions: [] },
  redis: { actions: redisActions, shells: serviceShells.redis },
  registry: { actions: registryActions, shells: serviceShells.registry },
  utilities: { actions: [] },
};

export const proxyShells = serviceShells.proxy;
