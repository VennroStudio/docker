import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib";
import { iconControlClass, type IconControlTone } from "./iconControlClass";

export type { IconControlTone };

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
  loading?: boolean;
  tone?: IconControlTone;
};

export function IconButton({
  children,
  className,
  disabled,
  label,
  loading = false,
  tone = "default",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(iconControlClass(tone), className)}
      disabled={disabled || loading}
      title={label}
      type="button"
      {...props}
    >
      {loading ? <LoaderCircle className="animate-spin" size={16} strokeWidth={2.4} /> : children}
    </button>
  );
}
