import { Copy } from "lucide-react";
import type { AppText, SshServerForm } from "@/entities/infrastructure";
import { Button, Field, IconButton, SelectField } from "@/shared/ui";

type SshServerFormFieldsProps = {
  copy: AppText["ssh"];
  error?: string;
  saving?: boolean;
  showSubmit?: boolean;
  submitLabel?: string;
  value: SshServerForm;
  onChange: (value: SshServerForm) => void;
  onCopyPassword?: () => void;
  onSubmit?: () => void;
};

export function SshServerFormFields({
  copy,
  error,
  onChange,
  onCopyPassword,
  onSubmit,
  saving,
  showSubmit = true,
  submitLabel,
  value,
}: SshServerFormFieldsProps) {
  const update = (key: keyof SshServerForm, nextValue: string) => onChange({ ...value, [key]: nextValue });

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label={copy.fields.name}
          placeholder={copy.placeholders.name}
          value={value.name}
          onChange={(event) => update("name", event.target.value)}
        />
        <Field
          label={copy.fields.host}
          placeholder={copy.placeholders.host}
          value={value.host}
          onChange={(event) => update("host", event.target.value)}
        />
        <Field
          label={copy.fields.user}
          placeholder={copy.placeholders.user}
          value={value.user}
          onChange={(event) => update("user", event.target.value)}
        />
        <Field
          label={copy.fields.port}
          placeholder={copy.placeholders.port}
          value={value.port}
          onChange={(event) => update("port", event.target.value)}
        />
        <SelectField
          label={copy.authType}
          options={[
            { label: copy.options.password, value: "password" },
            { label: copy.options.key, value: "key" },
          ]}
          value={value.authType}
          onChange={(event) => update("authType", event.target.value)}
        />
        <SelectField
          disabled={value.authType === "key"}
          label={copy.fields.passwordMode}
          options={[
            { label: copy.options.manual, value: "manual" },
            { label: copy.options.sshpass, value: "sshpass" },
          ]}
          value={value.passwordMode}
          onChange={(event) => update("passwordMode", event.target.value)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <Field
          label={copy.fields.password}
          placeholder={copy.placeholders.password}
          type="password"
          value={value.password}
          onChange={(event) => update("password", event.target.value)}
        />
        <IconButton
          className="h-10 w-10"
          disabled={!value.password}
          label={copy.actions.copyPassword}
          onClick={onCopyPassword}
        >
          <Copy size={16} strokeWidth={2.5} />
        </IconButton>
      </div>

      <Field
        label={copy.fields.keyPath}
        placeholder={copy.placeholders.keyPath}
        value={value.keyPath}
        onChange={(event) => update("keyPath", event.target.value)}
      />

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      {showSubmit ? (
        <div className="flex justify-end">
          <Button loading={saving} tone="primary" onClick={onSubmit}>
            {submitLabel || copy.actions.saveServer}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
