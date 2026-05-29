import { useMemo, useState } from "react";
import type { AppText, SshKeyForm, SshServer } from "@/entities/infrastructure";
import { Button, Field, Modal, SelectField, Switch } from "@/shared/ui";
import { validateSshKeyForm } from "../model/validation";

type SshKeyModalProps = {
  copy: AppText["ssh"];
  servers: SshServer[];
  onClose: () => void;
  onSubmit: (form: SshKeyForm) => void;
};

export function SshKeyModal({ copy, onClose, onSubmit, servers }: SshKeyModalProps) {
  const [form, setForm] = useState<SshKeyForm>({
    comment: "",
    force: false,
    keyPath: "",
    serverId: servers[0] ? String(servers[0].id) : "",
  });
  const [error, setError] = useState("");
  const serverOptions = useMemo(
    () => [
      { label: copy.validation.server, value: "" },
      ...servers.map((server) => ({
        label: `#${server.id} ${server.name} / ${server.user}@${server.host}`,
        value: String(server.id),
      })),
    ],
    [copy.validation.server, servers],
  );

  const submit = () => {
    const nextError = validateSshKeyForm(form, copy);
    setError(nextError);
    if (nextError) return;
    onSubmit(form);
    onClose();
  };

  return (
    <Modal title={copy.modals.generateKey} onClose={onClose}>
      <div className="grid gap-4">
        <SelectField
          label={copy.fields.server}
          options={serverOptions}
          value={form.serverId}
          onChange={(event) => setForm((current) => ({ ...current, serverId: event.target.value }))}
        />
        <Field
          label={copy.fields.keyPath}
          placeholder={copy.placeholders.keyPath}
          value={form.keyPath}
          onChange={(event) => setForm((current) => ({ ...current, keyPath: event.target.value }))}
        />
        <Field
          label={copy.fields.comment}
          placeholder={copy.placeholders.comment}
          value={form.comment}
          onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
        />
        <Switch
          checked={form.force}
          label={copy.fields.force}
          onChange={(force) => setForm((current) => ({ ...current, force }))}
        />
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        <div className="flex justify-end">
          <Button tone="primary" onClick={submit}>
            {copy.actions.generateKey}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
