import { Plus, Save, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import type { AppText, SshQuickCommand, SshServer } from "@/entities/infrastructure";
import { Button, IconButton } from "@/shared/ui";

type SshQuickCommandsBlockProps = {
  commands: SshQuickCommand[];
  copy: AppText["ssh"];
  server: SshServer;
  onAdd: (server: SshServer, command: string) => void;
  onInsert: (server: SshServer, command: string) => void;
  onRemove: (command: SshQuickCommand) => void;
  onUpdate: (command: SshQuickCommand, value: string) => void;
};

export function SshQuickCommandsBlock({
  commands,
  copy,
  onAdd,
  onInsert,
  onRemove,
  onUpdate,
  server,
}: SshQuickCommandsBlockProps) {
  const [newCommand, setNewCommand] = useState("");

  const addCommand = () => {
    const value = newCommand.trim();
    if (!value) return;
    onAdd(server, value);
    setNewCommand("");
  };

  return (
    <section className="rounded-lg border border-sky-100 bg-white/70 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.08)]">
      <BlockHeader eyebrow={copy.sections.commandsEyebrow} title={copy.sections.commandsTitle} />

      <div className="mt-4 grid gap-3">
        {commands.map((command) => (
          <QuickCommandRow
            key={`${command.id}:${command.command}`}
            command={command}
            copy={copy}
            server={server}
            onInsert={onInsert}
            onRemove={onRemove}
            onUpdate={onUpdate}
          />
        ))}

        <div className="grid gap-2 border-t border-sky-100 pt-3 md:grid-cols-[1fr_auto] md:items-center">
          <input
            aria-label={copy.fields.command}
            className="h-10 min-w-0 rounded-lg border border-sky-100 bg-white px-3 text-sm text-slate-950 shadow-[0_5px_14px_rgba(15,23,42,0.08)] outline-none transition placeholder:text-slate-400 focus:border-teal-500/70 focus:ring-2 focus:ring-teal-100"
            placeholder={copy.placeholders.command}
            value={newCommand}
            onChange={(event) => setNewCommand(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addCommand();
            }}
          />
          <Button
            disabled={!newCommand.trim()}
            icon={<Plus size={16} strokeWidth={2.5} />}
            tone="primary"
            onClick={addCommand}
          >
            {copy.actions.addCommand}
          </Button>
        </div>
      </div>
    </section>
  );
}

function QuickCommandRow({
  command,
  copy,
  onInsert,
  onRemove,
  onUpdate,
  server,
}: {
  command: SshQuickCommand;
  copy: AppText["ssh"];
  server: SshServer;
  onInsert: (server: SshServer, command: string) => void;
  onRemove: (command: SshQuickCommand) => void;
  onUpdate: (command: SshQuickCommand, value: string) => void;
}) {
  const [value, setValue] = useState(command.command);
  const normalizedValue = value.trim();
  const unchanged = normalizedValue === command.command;

  return (
    <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
      <input
        aria-label={copy.fields.command}
        className="h-10 min-w-0 rounded-lg border border-sky-100 bg-white px-3 text-sm text-slate-950 shadow-[0_5px_14px_rgba(15,23,42,0.08)] outline-none transition placeholder:text-slate-400 focus:border-teal-500/70 focus:ring-2 focus:ring-teal-100"
        placeholder={copy.placeholders.command}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <IconButton
        disabled={!normalizedValue}
        label={copy.actions.insertCommand}
        tone="primary"
        onClick={() => onInsert(server, normalizedValue)}
      >
        <Send size={16} strokeWidth={2.5} />
      </IconButton>
      <IconButton
        disabled={!normalizedValue || unchanged}
        label={copy.actions.saveCommand}
        tone="primary"
        onClick={() => onUpdate(command, normalizedValue)}
      >
        <Save size={16} strokeWidth={2.5} />
      </IconButton>
      <IconButton label={copy.actions.deleteCommand} tone="danger" onClick={() => onRemove(command)}>
        <Trash2 size={16} strokeWidth={2.5} />
      </IconButton>
    </div>
  );
}

function BlockHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase text-teal-700">{eyebrow}</span>
      <h3 className="mt-1 text-base font-bold text-slate-950">{title}</h3>
    </div>
  );
}
