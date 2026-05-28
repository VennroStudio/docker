import { RotateCcw, Save } from "lucide-react";
import type { FormEvent, InputHTMLAttributes } from "react";
import { useMemo, useState } from "react";
import type { AppText } from "@/entities/infrastructure";
import type { AppSettings, useSettings } from "@/entities/settings";
import { AccordionPanel, Button, Field } from "@/shared/ui";

export type SettingsConfigField = {
  autocomplete?: string;
  group: keyof AppSettings;
  label: string;
  name: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
};

type SettingsConfigAccordionProps = {
  copy: AppText["settings"];
  eyebrow: string;
  fields: SettingsConfigField[];
  settingsState: ReturnType<typeof useSettings>;
  title: string;
};

export function SettingsConfigAccordion({
  copy,
  eyebrow,
  fields,
  settingsState,
  title,
}: SettingsConfigAccordionProps) {
  const [open, setOpen] = useState(true);
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
      .then(() => {
        setDraft({});
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2200);
      })
      .catch(() => undefined);
  };

  return (
    <AccordionPanel contentClassName="px-4 py-4" eyebrow={eyebrow} open={open} title={title} onOpenChange={setOpen}>
      {settingsState.loading || !settings ? (
        <p className="text-sm font-semibold text-slate-500">{copy.loading}</p>
      ) : (
        <form className="grid gap-3" onSubmit={submit}>
          {fields.map((field) => {
            const key = fieldKey(field);

            return (
              <Field
                key={key}
                autoComplete={field.autocomplete}
                label={field.label}
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
                loading={settingsState.saving}
                tone="primary"
                type="submit"
              >
                {copy.save}
              </Button>
            </div>
          </div>
        </form>
      )}
    </AccordionPanel>
  );
}

function fieldKey(field: SettingsConfigField) {
  return `${String(field.group)}.${field.name}`;
}

function readSetting(settings: AppSettings, field: SettingsConfigField) {
  return (settings[field.group] as Record<string, string>)[field.name] ?? "";
}

function nextSettings(settings: AppSettings, fields: SettingsConfigField[], values: Record<string, string>) {
  const next: AppSettings = { ...settings };

  for (const field of fields) {
    next[field.group] = {
      ...(next[field.group] as Record<string, string>),
      [field.name]: values[fieldKey(field)] ?? "",
    } as never;
  }

  return next;
}
