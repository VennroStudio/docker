import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib";
import { iconControlClass, type IconControlTone } from "./iconControlClass";

export type { IconControlTone };

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
  tone?: IconControlTone;
};

export function IconButton({ children, className, label, tone = "default", ...props }: IconButtonProps) {
  return (
    <button aria-label={label} className={cn(iconControlClass(tone), className)} title={label} type="button" {...props}>
      {children}
    </button>
  );
}
