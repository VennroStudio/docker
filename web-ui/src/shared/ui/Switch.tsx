type SwitchProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function Switch({ checked, label, onChange }: SwitchProps) {
  return (
    <label className="flex h-10 items-center gap-3 rounded-lg border border-zinc-700/80 bg-zinc-950/72 px-3">
      <input
        className="peer sr-only"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className="relative h-5 w-9 rounded-full border border-zinc-700 bg-zinc-800 transition peer-checked:border-teal-300/60 peer-checked:bg-teal-400/30 after:absolute after:left-0.5 after:top-0.5 after:h-3.5 after:w-3.5 after:rounded-full after:bg-zinc-400 after:transition peer-checked:after:translate-x-4 peer-checked:after:bg-teal-100"
      />
      <strong className="text-sm font-semibold text-zinc-200">{label}</strong>
    </label>
  );
}
