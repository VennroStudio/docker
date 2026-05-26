import type { DatabaseInstancesCopy } from "./types";

type DatabaseSectionStateProps = {
  copy: DatabaseInstancesCopy;
  error: string | null;
  hasInstances: boolean;
  loading: boolean;
};

export function DatabaseSectionState({ copy, error, hasInstances, loading }: DatabaseSectionStateProps) {
  if (loading) return <p className="text-sm text-zinc-500">{copy.loading}</p>;

  if (error) {
    return (
      <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100">
        {copy.error}: {error}
      </p>
    );
  }

  if (!hasInstances) {
    return (
      <p className="rounded-lg border border-zinc-800 bg-zinc-900/45 px-3 py-2 text-sm text-zinc-500">{copy.empty}</p>
    );
  }

  return null;
}
