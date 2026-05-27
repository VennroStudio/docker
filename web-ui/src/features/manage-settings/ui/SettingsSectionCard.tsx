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
    <section className="rounded-lg border border-zinc-800/90 bg-zinc-950/58 p-4 shadow-sm shadow-black/20">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase text-teal-300/80">{copy.sectionEyebrow}</p>
        <h2 className="mt-1 text-lg font-bold text-zinc-50">{copy.sections[section.id]}</h2>
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
