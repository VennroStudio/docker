import { RotateCcw, Save } from "lucide-react";
import type { FormEvent, InputHTMLAttributes } from "react";
import { useMemo, useState } from "react";
import type { AppText } from "@/entities/infrastructure";
import { Button, Field } from "@/shared/ui";
import type { AppSettings } from "../model/types";
import type { useSettings } from "../model/useSettings";

export type SettingsConfigField = {
  autocomplete?: string;
  group: keyof AppSettings;
  label: string;
  name: string;
  placeholder?: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
};

type SettingsConfigFormProps = {
  copy: AppText["settings"];
  fields: SettingsConfigField[];
  generateEnvAfterSave?: boolean;
  settingsState: ReturnType<typeof useSettings>;
};

export function SettingsConfigForm({
  copy,
  fields,
  generateEnvAfterSave = false,
  settingsState,
}: SettingsConfigFormProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const settings = settingsState.settings;

  const values = useMemo(() => {
    return Object.fromEntries(
      fields.map((field) => {
        const key = fieldKey(field);
        return [key, draft[key] ?? (settings ? readSetting(settings, field) : "")];
      }),
    );
  }, [draft, fields, settings]);

  const dirty = useMemo(() => {
    if (!settings) return false;
    return fields.some((field) => values[fieldKey(field)] !== readSetting(settings, field));
  }, [fields, settings, values]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings || !dirty || settingsState.saving) return;

    void settingsState
      .save(nextSettings(settings, fields, values))
      .then(async () => {
        if (generateEnvAfterSave) await settingsState.generateEnv();
        setDraft({});
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2200);
      })
      .catch(() => undefined);
  };

  if (settingsState.loading || !settings) {
    return <p className="text-sm font-semibold text-slate-500">{copy.loading}</p>;
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      {fields.map((field) => {
        const key = fieldKey(field);

        return (
          <Field
            key={key}
            autoComplete={field.autocomplete}
            label={field.label}
            placeholder={field.placeholder}
            type={field.type}
            value={values[key]}
            onChange={(event) => {
              setSaved(false);
              setDraft((current) => ({ ...current, [key]: event.target.value }));
            }}
          />
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className="text-xs font-semibold text-slate-500">
          {settingsState.error ? settingsState.error : saved ? copy.saved : copy.clean}
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            icon={<RotateCcw size={16} strokeWidth={2.4} />}
            disabled={!dirty || settingsState.saving}
            type="button"
            onClick={() => setDraft({})}
          >
            {copy.reset}
          </Button>
          <Button
            icon={<Save size={16} strokeWidth={2.4} />}
            disabled={!dirty}
            loading={settingsState.saving || settingsState.generatingEnv}
            tone="primary"
            type="submit"
          >
            {copy.save}
          </Button>
        </div>
      </div>
    </form>
  );
}

function fieldKey(field: SettingsConfigField) {
  return `${String(field.group)}.${field.name}`;
}

function readSetting(settings: AppSettings, field: SettingsConfigField) {
  return (settings[field.group] as Record<string, string> | undefined)?.[field.name] ?? "";
}

function nextSettings(settings: AppSettings, fields: SettingsConfigField[], values: Record<string, string>) {
  const next: AppSettings = { ...settings };

  for (const field of fields) {
    next[field.group] = {
      ...(next[field.group] as Record<string, string> | undefined),
      [field.name]: values[fieldKey(field)] ?? "",
    } as never;
  }

  return next;
}
