import { useState } from "react";
import type { AppText } from "@/entities/infrastructure";
import type { useSettings } from "@/entities/settings";
import { AccordionPanel } from "@/shared/ui";
import { SettingsConfigForm, type SettingsConfigField } from "./SettingsConfigForm";

type SettingsConfigAccordionProps = {
  copy: AppText["settings"];
  eyebrow: string;
  fields: SettingsConfigField[];
  generateEnvAfterSave?: boolean;
  settingsState: ReturnType<typeof useSettings>;
  title: string;
};

export function SettingsConfigAccordion({
  copy,
  eyebrow,
  fields,
  generateEnvAfterSave,
  settingsState,
  title,
}: SettingsConfigAccordionProps) {
  const [open, setOpen] = useState(true);

  return (
    <AccordionPanel contentClassName="px-4 py-4" eyebrow={eyebrow} open={open} title={title} onOpenChange={setOpen}>
      <SettingsConfigForm
        copy={copy}
        fields={fields}
        generateEnvAfterSave={generateEnvAfterSave}
        settingsState={settingsState}
      />
    </AccordionPanel>
  );
}
