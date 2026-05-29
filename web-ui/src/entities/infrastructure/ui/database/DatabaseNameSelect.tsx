import { selectClassName } from "../../model/database/formUtils";

type DatabaseNameSelectProps = {
  copy: {
    database: string;
    databasePlaceholder: string;
    validation: {
      database: string;
    };
  };
  disabled?: boolean;
  error?: string | null;
  invalid?: boolean;
  loading?: boolean;
  loadingPlaceholder: string;
  names: string[];
  value: string;
  onChange: (value: string) => void;
};

export function DatabaseNameSelect({
  copy,
  disabled = false,
  error,
  invalid = false,
  loading = false,
  loadingPlaceholder,
  names,
  onChange,
  value,
}: DatabaseNameSelectProps) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-xs font-semibold uppercase text-slate-500">{copy.database}</span>
      <select
        className={selectClassName}
        disabled={disabled || loading || names.length === 0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{loading ? loadingPlaceholder : copy.databasePlaceholder}</option>
        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : invalid ? (
        <span className="text-xs font-medium text-red-600">{copy.validation.database}</span>
      ) : null}
    </label>
  );
}
