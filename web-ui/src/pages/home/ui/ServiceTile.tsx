import { ArrowUpRight } from "lucide-react";
import { getViewById } from "@/entities/infrastructure";
import type { AppText } from "@/entities/infrastructure";
import type { ServiceStatus, ViewId } from "@/entities/infrastructure";
import type { HomeService } from "../model/homeSections";

type ServiceTileProps = {
  service: HomeService;
  status?: ServiceStatus;
  text: AppText;
  onOpen: (viewId: ViewId) => void;
};

export function ServiceTile({ onOpen, service, status, text }: ServiceTileProps) {
  const view = getViewById(service.id);
  const Icon = view.icon;
  const card = text.home.serviceCards[service.id];
  const state = status?.state || "unknown";

  return (
    <button
      className="group flex min-h-36 items-start gap-4 rounded-lg border border-zinc-800/90 bg-zinc-950/56 p-4 text-left shadow-sm shadow-black/15 transition hover:border-teal-300/35 hover:bg-zinc-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60"
      type="button"
      onClick={() => onOpen(service.id)}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-zinc-700/80 bg-zinc-900 text-teal-200">
        <Icon size={19} strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-2 flex flex-wrap items-center gap-2">
          <small className="text-xs font-semibold uppercase text-zinc-500">{card?.meta}</small>
          {status ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-zinc-400">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  state === "running"
                    ? "bg-emerald-300"
                    : state === "partial"
                      ? "bg-teal-300"
                      : state === "stopped"
                        ? "bg-amber-300"
                        : "bg-zinc-500"
                }`}
              />
              {text.common.statusLabels[status.state]} {status.running}/{status.total}
            </span>
          ) : null}
        </span>
        <strong className="block truncate text-base font-bold text-zinc-50">{card?.title}</strong>
        <span className="mt-2 block text-sm leading-6 text-zinc-400">{card?.description}</span>
      </span>
      <ArrowUpRight
        className="mt-1 shrink-0 text-zinc-600 transition group-hover:text-teal-200"
        size={16}
        strokeWidth={2.4}
      />
    </button>
  );
}
