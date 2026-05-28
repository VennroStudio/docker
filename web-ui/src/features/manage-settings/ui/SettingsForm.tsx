import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { AppText } from "@/entities/infrastructure";
import type { AppSettings, GenerateEnvResponse, SettingsResponse } from "@/entities/settings";
import { settingsSections, type SettingsFieldDefinition } from "../model/settingsSections";
import { SettingsSectionCard } from "./SettingsSectionCard";
import { SettingsSourceCard } from "./SettingsSourceCard";
import { SettingsSubmitBar } from "./SettingsSubmitBar";

type SettingsFormProps = {
  copy: AppText["settings"];
  exists: boolean;
  loading?: boolean;
  generatingEnv?: boolean;
  path: string;
  saving?: boolean;
  settings: AppSettings;
  onGenerateEnv: () => Promise<GenerateEnvResponse>;
  onSave: (settings: AppSettings) => Promise<SettingsResponse>;
};

export function SettingsForm({
  copy,
  exists,
  generatingEnv = false,
  loading = false,
  onGenerateEnv,
  onSave,
  path,
  saving = false,
  settings,
}: SettingsFormProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [envGenerated, setEnvGenerated] = useState(false);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(savedSettings), [draft, savedSettings]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || saving) return;

    void onSave(draft)
      .then((response) => {
        setDraft(response.settings);
        setSavedSettings(response.settings);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2200);
      })
      .catch(() => undefined);
  };

  const updateField = (field: SettingsFieldDefinition, value: string) => {
    setSaved(false);
    setEnvGenerated(false);
    setDraft((current) => {
      return {
        ...current,
        [field.group]: {
          ...current[field.group],
          [field.name]: value,
        },
      };
    });
  };

  const readField = (field: SettingsFieldDefinition) =>
    (draft[field.group] as Record<string, string>)[field.name] ?? "";

  if (loading) {
    return (
      <section className="rounded-lg border border-sky-100/90 bg-white/76 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.12)]">
        <p className="text-sm font-semibold text-slate-500">{copy.loading}</p>
      </section>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <SettingsSourceCard
        copy={copy}
        envGenerated={envGenerated}
        exists={exists}
        generateDisabled={dirty}
        generatingEnv={generatingEnv}
        path={path}
        onGenerateEnv={() => {
          void onGenerateEnv()
            .then(() => {
              setEnvGenerated(true);
              window.setTimeout(() => setEnvGenerated(false), 2200);
            })
            .catch(() => undefined);
        }}
      />

      <div className="grid gap-4 min-[1280px]:grid-cols-2">
        {settingsSections.map((section) => (
          <SettingsSectionCard
            key={section.id}
            copy={copy}
            readField={readField}
            section={section}
            onFieldChange={updateField}
          />
        ))}
      </div>

      <SettingsSubmitBar
        copy={copy}
        dirty={dirty}
        saved={saved}
        saving={saving}
        onReset={() => setDraft(savedSettings)}
      />
    </form>
  );
}
