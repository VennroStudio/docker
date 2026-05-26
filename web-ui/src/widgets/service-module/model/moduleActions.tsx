import { ArrowDown, ArrowUp, ListTree, Play, Plus, Square, TerminalSquare, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { CommandAction } from "@/entities/infrastructure";

export type ModuleActionSuffix = "add" | "clean" | "delete" | "down" | "logs" | "start" | "stop" | "up";
export type ModuleActionTone = "danger" | "default" | "primary" | "success";

const actionOrder: ModuleActionSuffix[] = ["up", "down", "start", "stop", "logs", "clean", "add", "delete"];

export const moduleActionIcon: Record<ModuleActionSuffix | "shell", ReactNode> = {
  add: <Plus size={16} strokeWidth={2.7} />,
  clean: <Trash2 size={16} strokeWidth={2.5} />,
  delete: <Trash2 size={16} strokeWidth={2.5} />,
  down: <ArrowDown size={16} strokeWidth={2.7} />,
  logs: <ListTree size={16} strokeWidth={2.4} />,
  shell: <TerminalSquare size={16} strokeWidth={2.4} />,
  start: <Play size={16} strokeWidth={2.6} />,
  stop: <Square size={15} strokeWidth={2.6} />,
  up: <ArrowUp size={16} strokeWidth={2.7} />,
};

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
