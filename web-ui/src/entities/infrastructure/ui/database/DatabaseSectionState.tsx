import type { DatabaseInstancesCopy } from "./types";

type DatabaseSectionStateProps = {
  copy: DatabaseInstancesCopy;
  error: string | null;
  hasInstances: boolean;
  loading: boolean;
};

export function DatabaseSectionState({ copy, error, hasInstances, loading }: DatabaseSectionStateProps) {
  if (loading) return <p className="text-sm text-slate-500">{copy.loading}</p>;

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-[0_8px_18px_rgba(249,115,22,0.12)]">
        {copy.error}: {error}
      </p>
    );
  }

  if (!hasInstances) {
    return (
      <p className="rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-slate-500 shadow-[0_6px_14px_rgba(14,165,233,0.08)]">
        {copy.empty}
      </p>
    );
  }

  return null;
}
