import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib";

type AccordionPanelProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  defaultTitleElement?: "strong" | "span";
  eyebrow: ReactNode;
  open: boolean;
  title: string;
  titlePrefix?: ReactNode;
  onOpenChange: (open: boolean) => void;
};

export function AccordionPanel({
  actions,
  children,
  className,
  contentClassName = "p-4",
  defaultTitleElement = "strong",
  eyebrow,
  onOpenChange,
  open,
  title,
  titlePrefix,
}: AccordionPanelProps) {
  const TitleElement = defaultTitleElement;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-sky-100/90 bg-white/78 shadow-[0_14px_34px_rgba(14,165,233,0.12),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/45 backdrop-blur",
        className,
      )}
    >
      <header
        className="flex cursor-pointer items-center gap-4 px-4 py-3 transition hover:bg-sky-50/55"
        onClick={() => onOpenChange(!open)}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase text-slate-500">{eyebrow}</span>
          <span className="mt-1 flex min-w-0 items-center gap-2">
            {titlePrefix ? <span className="flex shrink-0">{titlePrefix}</span> : null}
            <TitleElement className="block min-w-0 truncate text-base font-bold text-slate-950">{title}</TitleElement>
          </span>
        </span>
        {actions ? (
          <span
            className="flex shrink-0 flex-wrap items-center justify-end gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            {actions}
          </span>
        ) : null}
        <ChevronDown
          className={cn("shrink-0 text-slate-500 transition", open && "rotate-180 text-slate-900")}
          size={18}
          strokeWidth={2.4}
        />
      </header>

      {open ? <div className={cn("border-t border-sky-100", contentClassName)}>{children}</div> : null}
    </section>
  );
}
