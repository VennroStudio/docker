import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui";
import type { DatabaseDumpFile } from "../../model/database/formTypes";
import { selectClassName } from "../../model/database/formUtils";

type DatabaseDumpFileSelectProps<File extends DatabaseDumpFile> = {
  copy: {
    emptyFiles: string;
    fileSelect: string;
    fileSelectPlaceholder: string;
    refreshFiles: string;
  };
  disabled?: boolean;
  error?: string | null;
  files: File[];
  loading?: boolean;
  onRefresh: () => void;
  onSelect: (path: string) => void;
};

export function DatabaseDumpFileSelect<File extends DatabaseDumpFile>({
  copy,
  disabled = false,
  error,
  files,
  loading = false,
  onRefresh,
  onSelect,
}: DatabaseDumpFileSelectProps<File>) {
  return (
    <>
      <div className="grid gap-3 min-[780px]:grid-cols-[minmax(0,1fr)_auto] min-[780px]:items-end">
        <label className="grid gap-2 text-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">{copy.fileSelect}</span>
          <select
            className={selectClassName}
            disabled={disabled || loading || files.length === 0}
            value=""
            onChange={(event) => {
              const nextPath = event.target.value;
              if (nextPath) onSelect(nextPath);
            }}
          >
            <option value="">
              {loading ? copy.refreshFiles : files.length > 0 ? copy.fileSelectPlaceholder : copy.emptyFiles}
            </option>
            {files.map((file) => (
              <option key={file.path} value={file.path}>
                {file.path}
              </option>
            ))}
          </select>
        </label>
        <Button
          disabled={disabled || loading}
          icon={<RefreshCw size={16} strokeWidth={2.4} />}
          loading={loading}
          type="button"
          onClick={onRefresh}
        >
          {copy.refreshFiles}
        </Button>
      </div>

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </>
  );
}
