import { mariadbActions, minioActions, postgresActions, redisActions, registryActions } from "./actions";
import { serviceShells } from "./shells";
import type { CommandAction, ShellAction, ViewId } from "../model/types";

export type CommandPageId = Exclude<ViewId, "home" | "proxy" | "settings">;

export const commandPageRegistry: Record<CommandPageId, { actions: CommandAction[]; shells?: ShellAction[] }> = {
  mariadb: { actions: mariadbActions, shells: serviceShells.mariadb },
  minio: { actions: minioActions, shells: serviceShells.minio },
  network: { actions: [] },
  nginx: { actions: [], shells: serviceShells.nginx },
  postgres: { actions: postgresActions, shells: serviceShells.postgres },
  redis: { actions: redisActions, shells: serviceShells.redis },
  registry: { actions: registryActions, shells: serviceShells.registry },
};

export const proxyShells = serviceShells.proxy;
