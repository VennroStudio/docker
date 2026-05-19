import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { CommandTone } from "../types/commands";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: CommandTone;
  icon?: ReactNode;
};

export function Button({ className = "", icon, tone = "default", children, ...props }: ButtonProps) {
  return (
    <button className={`button button-${tone} ${className}`.trim()} {...props}>
      {icon ? <span className="button-icon">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
