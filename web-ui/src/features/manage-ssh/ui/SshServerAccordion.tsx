import { KeyRound, Send, TerminalSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import type { AppText, SshQuickCommand, SshServer, SshServerForm } from "@/entities/infrastructure";
import { AccordionPanel, IconButton } from "@/shared/ui";
import { validateSshServerForm } from "../model/validation";
import { SshQuickCommandsBlock } from "./SshQuickCommandsBlock";
import { SshServerFormFields } from "./SshServerFormFields";

type SshServerAccordionProps = {
  commands: SshQuickCommand[];
  copy: AppText["ssh"];
  server: SshServer;
  onCopyPassword: (password: string) => void;
  onCommandAdd: (server: SshServer, command: string) => void;
  onCommandInsert: (server: SshServer, command: string) => void;
  onCommandRemove: (command: SshQuickCommand) => void;
  onCommandUpdate: (command: SshQuickCommand, value: string) => void;
  onDelete: (server: SshServer) => void;
  onKeyRemove: (server: SshServer) => void;
  onKeyPush: (server: SshServer) => void;
  onSave: (server: SshServer, form: SshServerForm) => void;
  onTerminalOpen: (server: SshServer) => void;
};

export function SshServerAccordion({
  commands,
  copy,
  onCommandAdd,
  onCommandInsert,
  onCommandRemove,
  onCommandUpdate,
  onCopyPassword,
  onDelete,
  onKeyRemove,
  onKeyPush,
  onSave,
  onTerminalOpen,
  server,
}: SshServerAccordionProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SshServerForm>(serverForm(server));
  const [error, setError] = useState("");

  const save = () => {
    const nextError = validateSshServerForm(form, copy);
    setError(nextError);
    if (nextError) return;
    onSave(server, form);
  };

  return (
    <AccordionPanel
      contentClassName="p-4"
      eyebrow={<AuthBadge copy={copy} server={server} />}
      open={open}
      title={server.name}
      actions={
        <>
          <IconButton label={copy.actions.terminal} tone="primary" onClick={() => onTerminalOpen(server)}>
            <TerminalSquare size={16} strokeWidth={2.5} />
          </IconButton>
          <IconButton label={copy.actions.keyPush} tone="primary" onClick={() => onKeyPush(server)}>
            <Send size={16} strokeWidth={2.5} />
          </IconButton>
          <IconButton
            disabled={!server.keyPath}
            label={copy.actions.keyRemove}
            tone="danger"
            onClick={() => onKeyRemove(server)}
          >
            <KeyRound size={16} strokeWidth={2.5} />
          </IconButton>
          <IconButton label={copy.actions.deleteServer} tone="danger" onClick={() => onDelete(server)}>
            <Trash2 size={16} strokeWidth={2.5} />
          </IconButton>
        </>
      }
      onOpenChange={setOpen}
    >
      <div className="grid gap-4">
        <section className="rounded-lg border border-sky-100 bg-white/70 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.08)]">
          <BlockHeader eyebrow={copy.sections.serverEyebrow} title={copy.sections.serverTitle} />
          <div className="mt-4">
            <SshServerFormFields
              copy={copy}
              error={error}
              value={form}
              onChange={setForm}
              onCopyPassword={() => onCopyPassword(form.password)}
              onSubmit={save}
            />
          </div>
        </section>

        <SshQuickCommandsBlock
          commands={commands}
          copy={copy}
          server={server}
          onAdd={onCommandAdd}
          onInsert={onCommandInsert}
          onRemove={onCommandRemove}
          onUpdate={onCommandUpdate}
        />
      </div>
    </AccordionPanel>
  );
}

function AuthBadge({ copy, server }: { copy: AppText["ssh"]; server: SshServer }) {
  return (
    <span className="inline-flex rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-bold uppercase text-slate-500 shadow-[0_4px_10px_rgba(14,165,233,0.10)]">
      {server.authType === "key" ? copy.options.key : copy.options.password}
    </span>
  );
}

function serverForm(server: SshServer): SshServerForm {
  return {
    authType: server.authType,
    host: server.host,
    keyPath: server.keyPath,
    name: server.name,
    password: server.password,
    passwordMode: server.passwordMode,
    port: server.port,
    user: server.user,
  };
}

function BlockHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase text-teal-700">{eyebrow}</span>
      <h3 className="mt-1 text-base font-bold text-slate-950">{title}</h3>
    </div>
  );
}
