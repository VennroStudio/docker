import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { CommandTone } from "../types/commands";

type CommandCardProps = {
  action: {
    detail: string;
    id: string;
    label: string;
    tone?: CommandTone;
  };
  icon?: ReactNode;
  onRun: () => void;
};

export function CommandCard({ action, icon = <ArrowUpRight size={16} strokeWidth={2.4} />, onRun }: CommandCardProps) {
  return (
    <button className={`command-card command-card-${action.tone || "default"}`} type="button" onClick={onRun}>
      <span>
        <strong>{action.label}</strong>
        <small>{action.detail}</small>
      </span>
      {icon}
    </button>
  );
}
