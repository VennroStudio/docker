import type { ReactNode } from "react";
import { IconButton } from "@/shared/ui";
import type { ModuleActionTone } from "../model/moduleActions";

type ModuleActionButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  loading?: boolean;
  title?: string;
  tone: ModuleActionTone;
  onClick: () => void;
};

export function ModuleActionButton({
  children,
  disabled,
  label,
  loading = false,
  onClick,
  title,
  tone,
}: ModuleActionButtonProps) {
  return (
    <IconButton disabled={disabled} label={label} loading={loading} title={title} tone={tone} onClick={onClick}>
      {children}
    </IconButton>
  );
}
