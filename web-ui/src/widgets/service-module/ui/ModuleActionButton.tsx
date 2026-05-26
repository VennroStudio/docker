import type { ReactNode } from "react";
import { IconButton } from "@/shared/ui";
import type { ModuleActionTone } from "../model/moduleActions";

type ModuleActionButtonProps = {
  children: ReactNode;
  label: string;
  tone: ModuleActionTone;
  onClick: () => void;
};

export function ModuleActionButton({ children, label, onClick, tone }: ModuleActionButtonProps) {
  return (
    <IconButton label={label} tone={tone} onClick={onClick}>
      {children}
    </IconButton>
  );
}
