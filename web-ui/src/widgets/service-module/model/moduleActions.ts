import type { CommandAction } from "@/entities/infrastructure";

export type ModuleActionSuffix = "add" | "clean" | "delete" | "down" | "logs" | "start" | "stop" | "up";
export type ModuleActionTone = "danger" | "default" | "primary" | "success";

const actionOrder: ModuleActionSuffix[] = ["up", "down", "start", "stop", "logs", "clean", "add", "delete"];

export const moduleActionTone: Record<ModuleActionSuffix | "shell", ModuleActionTone> = {
  add: "success",
  clean: "danger",
  delete: "danger",
  down: "danger",
  logs: "default",
  shell: "primary",
  start: "default",
  stop: "danger",
  up: "success",
};

export function orderModuleActions(actions: CommandAction[]) {
  const indexed = actions.map((action, index) => ({
    action,
    index,
    suffix: action.id.split(":")[1] as ModuleActionSuffix,
  }));

  return indexed
    .filter((item) => actionOrder.includes(item.suffix))
    .sort(
      (left, right) => actionOrder.indexOf(left.suffix) - actionOrder.indexOf(right.suffix) || left.index - right.index,
    );
}
