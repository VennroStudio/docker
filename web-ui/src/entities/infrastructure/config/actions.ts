import commandManifest from "../../../../commands.manifest.json";
import type { CommandAction, CommandGroupId, CommandId, CommandTone } from "../model/types";

const fallbackText = (id: CommandId) => id.replace(":", " ");

function actionsFor(group: CommandGroupId): CommandAction[] {
  return commandManifest.groups[group].map((id) => {
    const commandId = id as CommandId;
    const command = commandManifest.commands[commandId];

    return {
      confirm: command.confirm,
      detail: command.preview,
      id: commandId,
      label: fallbackText(commandId),
      tone: command.tone as CommandTone,
    };
  });
}

export const mariadbActions = actionsFor("mariadb");
export const rustfsActions = actionsFor("rustfs");
export const nginxActions = actionsFor("nginx");
export const pgadminActions = actionsFor("pgadmin");
export const phpmyadminActions = actionsFor("phpmyadmin");
export const postgresActions = actionsFor("postgres");
export const redisActions = actionsFor("redis");
export const redisinsightActions = actionsFor("redisinsight");
export const registryActions = actionsFor("registry");
export const registryUiActions = actionsFor("registry-ui");
