import type { AppText, ProxyFormState } from "@/entities/infrastructure";
import { Field, Switch } from "@/shared/ui";
import { getProxyFieldValidity } from "../model/validation";

type ProxyFormFieldsProps = {
  copy: AppText["panels"]["proxy"];
  value: ProxyFormState;
  onChange: (patch: Partial<ProxyFormState>) => void;
};

export function ProxyFormFields({ copy, onChange, value }: ProxyFormFieldsProps) {
  const validity = getProxyFieldValidity(value);

  return (
    <div className="grid gap-3">
      <Field
        error={value.domain.trim() && !validity.domain ? copy.validation.domain : undefined}
        hint={copy.hints.domain}
        label={copy.domain}
        value={value.domain}
        onChange={(event) => onChange({ domain: event.target.value })}
      />
      <Field
        error={value.target.trim() && !validity.target ? copy.validation.target : undefined}
        hint={copy.hints.target}
        label={copy.target}
        value={value.target}
        onChange={(event) => onChange({ target: event.target.value })}
      />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Field
          error={value.port.trim() && !validity.port ? copy.validation.port : undefined}
          hint={copy.hints.port}
          label="Port"
          value={value.port}
          inputMode="numeric"
          onChange={(event) => onChange({ port: event.target.value })}
        />
        <Switch label="SSL" checked={value.ssl} onChange={(ssl) => onChange({ ssl })} />
      </div>
    </div>
  );
}
