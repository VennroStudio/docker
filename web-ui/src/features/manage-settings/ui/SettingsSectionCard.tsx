import type { AppText } from "@/entities/infrastructure";
import { Field } from "@/shared/ui";
import type { SettingsFieldDefinition, SettingsSectionDefinition } from "../model/settingsSections";

type SettingsSectionCardProps = {
  copy: AppText["settings"];
  section: SettingsSectionDefinition;
  readField: (field: SettingsFieldDefinition) => string;
  onFieldChange: (field: SettingsFieldDefinition, value: string) => void;
};

export function SettingsSectionCard({ copy, onFieldChange, readField, section }: SettingsSectionCardProps) {
  return (
    <section className="rounded-lg border border-sky-100/90 bg-white/76 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.12),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/45 backdrop-blur">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase text-teal-700">{copy.sectionEyebrow}</p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">{copy.sections[section.id]}</h2>
      </header>
      <div className="grid gap-3">
        {section.fields.map((field) => (
          <Field
            key={`${field.group}.${field.name}`}
            autoComplete={field.autocomplete}
            label={`${field.label} / ${field.env}`}
            placeholder={field.placeholder}
            type={field.type || "text"}
            value={readField(field)}
            onChange={(event) => onFieldChange(field, event.target.value)}
          />
        ))}
      </div>
    </section>
  );
}
