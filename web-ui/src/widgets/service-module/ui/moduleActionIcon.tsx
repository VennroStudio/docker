import { ArrowDown, ArrowUp, ListTree, Play, Plus, Square, TerminalSquare, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { ModuleActionSuffix } from "../model/moduleActions";

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
