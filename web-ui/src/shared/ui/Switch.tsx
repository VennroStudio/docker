type SwitchProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function Switch({ checked, label, onChange }: SwitchProps) {
  return (
    <label className="flex h-10 items-center gap-3 rounded-lg border border-sky-100 bg-white px-3 shadow-[0_5px_14px_rgba(14,165,233,0.10)]">
      <input
        className="peer sr-only"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className="relative h-5 w-9 rounded-full border border-slate-300 bg-slate-100 transition peer-checked:border-teal-500/50 peer-checked:bg-teal-100 after:absolute after:left-0.5 after:top-0.5 after:h-3.5 after:w-3.5 after:rounded-full after:bg-slate-400 after:transition peer-checked:after:translate-x-4 peer-checked:after:bg-teal-600"
      />
      <strong className="text-sm font-semibold text-slate-700">{label}</strong>
    </label>
  );
}
