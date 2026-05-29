import { Send, ShieldCheck, TerminalSquare, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { AppText, SshServer, SshServerForm } from "@/entities/infrastructure";
import { AccordionPanel, IconButton } from "@/shared/ui";
import { validateSshServerForm } from "../model/validation";
import { SshServerFormFields } from "./SshServerFormFields";

type SshServerAccordionProps = {
  copy: AppText["ssh"];
  server: SshServer;
  onCopyPassword: (password: string) => void;
  onDelete: (server: SshServer) => void;
  onKeyPush: (server: SshServer) => void;
  onKeyTest: (server: SshServer) => void;
  onSave: (server: SshServer, form: SshServerForm) => void;
  onTerminalOpen: (server: SshServer) => void;
};

export function SshServerAccordion({
  copy,
  onCopyPassword,
  onDelete,
  onKeyPush,
  onKeyTest,
  onSave,
  onTerminalOpen,
  server,
}: SshServerAccordionProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SshServerForm>(serverForm(server));
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(serverForm(server));
  }, [server]);

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
          <IconButton label={copy.actions.keyPush} tone="primary" onClick={() => onKeyPush(server)}>
            <Send size={16} strokeWidth={2.5} />
          </IconButton>
          <IconButton label={copy.actions.keyTest} onClick={() => onKeyTest(server)}>
            <ShieldCheck size={16} strokeWidth={2.5} />
          </IconButton>
          <IconButton label={copy.actions.deleteServer} tone="danger" onClick={() => onDelete(server)}>
            <Trash2 size={16} strokeWidth={2.5} />
          </IconButton>
          <IconButton label={copy.actions.terminal} tone="primary" onClick={() => onTerminalOpen(server)}>
            <TerminalSquare size={16} strokeWidth={2.5} />
          </IconButton>
        </>
      }
      onOpenChange={setOpen}
    >
      <SshServerFormFields
        copy={copy}
        error={error}
        value={form}
        onChange={setForm}
        onCopyPassword={() => onCopyPassword(form.password)}
        onSubmit={save}
      />
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
