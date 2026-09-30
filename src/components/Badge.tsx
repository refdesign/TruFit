const BADGE = {
  measured: { label: "Measured", icon: "●", cls: "border-measured/50 text-measured bg-measured/10" },
  inferred: { label: "Inferred", icon: "◐", cls: "border-inferred/50 text-inferred bg-inferred/10" },
  user: { label: "User Input", icon: "✎", cls: "border-ink/30 text-ink bg-panel2" },
} as const;

export function Badge({ kind, children }: { kind: keyof typeof BADGE; children?: React.ReactNode }) {
  const b = BADGE[kind];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${b.cls}`}>
      <span aria-hidden>{b.icon}</span>
      {b.label}
      {children}
    </span>
  );
}
