import type { CommandAction } from "../../shared/types/commands";
import { CommandCard } from "../../shared/ui/CommandCard";
import { Panel } from "../../shared/ui/Panel";

type CommandPanelProps = {
  title: string;
  eyebrow: string;
  actions: CommandAction[];
  onRun: (action: CommandAction) => void;
};

export function CommandPanel({ actions, eyebrow, onRun, title }: CommandPanelProps) {
  return (
    <Panel title={title} eyebrow={eyebrow}>
      <div className="command-grid">
        {actions.map((action) => (
          <CommandCard key={action.id + action.label} action={action} onRun={() => onRun(action)} />
        ))}
      </div>
    </Panel>
  );
}
