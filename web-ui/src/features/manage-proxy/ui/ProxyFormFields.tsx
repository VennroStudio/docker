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
        label={copy.domain}
        placeholder="pma.local"
        value={value.domain}
        onChange={(event) => onChange({ domain: event.target.value })}
      />
      <Field
        error={value.target.trim() && !validity.target ? copy.validation.target : undefined}
        label={copy.target}
        placeholder="phpmyadmin-container"
        value={value.target}
        onChange={(event) => onChange({ target: event.target.value })}
      />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <Field
          error={value.port.trim() && !validity.port ? copy.validation.port : undefined}
          label="Port"
          placeholder="1-65535"
          value={value.port}
          inputMode="numeric"
          onChange={(event) => onChange({ port: event.target.value })}
        />
        <div className="sm:pt-6">
          <Switch label="SSL" checked={value.ssl} onChange={(ssl) => onChange({ ssl })} />
        </div>
      </div>
    </div>
  );
}
