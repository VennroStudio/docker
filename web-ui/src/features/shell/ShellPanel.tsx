import { TerminalSquare } from "lucide-react";
import type { ShellAction } from "../../shared/types/commands";
import { CommandCard } from "../../shared/ui/CommandCard";
import { Panel } from "../../shared/ui/Panel";

type ShellPanelProps = {
  actions: ShellAction[];
  eyebrow: string;
  title: string;
  onOpen: (action: ShellAction) => void;
};

export function ShellPanel({ actions, eyebrow, onOpen, title }: ShellPanelProps) {
  if (actions.length === 0) return null;

  return (
    <Panel title={title} eyebrow={eyebrow}>
      <div className="command-grid shell-grid">
        {actions.map((action) => (
          <CommandCard
            key={action.container}
            action={{
              detail: action.detail,
              id: `shell:${action.container}`,
              label: action.label,
              tone: "primary",
            }}
            icon={<TerminalSquare size={16} strokeWidth={2.4} />}
            onRun={() => onOpen(action)}
          />
        ))}
      </div>
    </Panel>
  );
}
