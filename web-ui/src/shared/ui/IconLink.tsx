import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib";
import { iconControlClass, type IconControlTone } from "./iconControlClass";

type IconLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  label: string;
  tone?: IconControlTone;
};

export function IconLink({ children, className, label, tone = "primary", ...props }: IconLinkProps) {
  return (
    <a
      aria-label={label}
      rel="noreferrer"
      target="_blank"
      title={props.title || label}
      {...props}
      className={cn(iconControlClass(tone), className)}
    >
      {children}
    </a>
  );
}
