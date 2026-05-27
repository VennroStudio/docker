type DatabaseBlockHeaderProps = {
  eyebrow: string;
  title: string;
};

export function DatabaseBlockHeader({ eyebrow, title }: DatabaseBlockHeaderProps) {
  return (
    <header className="mb-3">
      <span className="text-[11px] font-semibold uppercase text-teal-700">{eyebrow}</span>
      <strong className="mt-1 block text-sm font-bold text-slate-950">{title}</strong>
    </header>
  );
}
