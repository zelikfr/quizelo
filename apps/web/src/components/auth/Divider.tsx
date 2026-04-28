interface DividerProps {
  label: string;
}

export function Divider({ label }: DividerProps) {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-white/[0.08]" />
      <span className="font-mono text-[9px] uppercase tracking-widest2 text-fg-3">
        {label}
      </span>
      <span className="h-px flex-1 bg-white/[0.08]" />
    </div>
  );
}
