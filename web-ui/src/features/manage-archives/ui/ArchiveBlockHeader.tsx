type ArchiveBlockHeaderProps = {
  eyebrow: string;
  title: string;
};

export function ArchiveBlockHeader({ eyebrow, title }: ArchiveBlockHeaderProps) {
  return (
    <header className="mb-4">
      <p className="text-xs font-semibold uppercase text-teal-700">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-bold text-slate-950">{title}</h2>
    </header>
  );
}
