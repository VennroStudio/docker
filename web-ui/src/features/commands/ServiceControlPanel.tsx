import { TerminalSquare } from "lucide-react";
import type { CommandAction, ShellAction } from "../../shared/types/commands";
import { CommandCard } from "../../shared/ui/CommandCard";
import { Panel } from "../../shared/ui/Panel";

type ServiceControlPanelProps = {
  actions: CommandAction[];
  eyebrow: string;
  shell?: ShellAction;
  title: string;
  onRun: (action: CommandAction) => void;
  onShellOpen?: (action: ShellAction) => void;
};

export function ServiceControlPanel({ actions, eyebrow, onRun, onShellOpen, shell, title }: ServiceControlPanelProps) {
  return (
    <Panel title={title} eyebrow={eyebrow}>
      <div className="service-control-grid">
        {actions.map((action) => (
          <CommandCard key={action.id} action={action} onRun={() => onRun(action)} />
        ))}
        {shell ? (
          <CommandCard
            action={{ ...shell, id: `shell:${shell.container}`, tone: "primary" }}
            icon={<TerminalSquare size={16} strokeWidth={2.4} />}
            onRun={() => onShellOpen?.(shell)}
          />
        ) : null}
      </div>
    </Panel>
  );
}
