"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/Badge";
import { EditMeasurementDialog } from "@/components/EditMeasurementDialog";
import { confidenceLevel } from "@/components/MeasurementList";
import { ReconstructScene, chipText } from "@/components/ReconstructScene";
import { INITIAL_ROWS, REFERENCE, fmt, useMeasurements } from "@/lib/measurements";
import { reach } from "@/lib/progress";
import { SPOTS } from "@/lib/scene";

export default function ReconstructPage() {
  const router = useRouter();
  const { rows, setRows, hydrated } = useMeasurements();
  const [editKey, setEditKey] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const editing = rows.find((r) => r.key === editKey) ?? null;

  const save = (key: string, value: string) => {
    setRows((rs) =>
      rs.map((r) => {
        if (r.key !== key) return r;
        const was = INITIAL_ROWS.find((i) => i.key === key)!;
        if (Number(value) === Number(was.value)) return was;
        return { ...r, value, kind: "user", note: `You replaced the detected value (${fmt(Number(was.value))} mm)` };
      }),
    );
    setEditKey(null);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <p className="mb-4 text-sm text-mute">
        <span className="font-bold text-ink">Scene reconstructed to scale from your photos.</span> The scale reference was identified, and every gear and shaft was measured from it. Tap a measurement to edit it.
      </p>

      <div className={hydrated ? "" : "invisible"}>
        <ReconstructScene rows={rows} onSelect={setEditKey} onHover={setHoverKey} activeKey={hoverKey} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <section className="self-start rounded-xl border border-line bg-panel p-4" aria-labelledby="ref-h">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="ref-h" className="text-xs font-semibold uppercase tracking-wider text-mute">Scale reference</h2>
              <p className="mt-1 text-base font-semibold">{REFERENCE.name}</p>
            </div>
            <span className="rounded-full border border-brand/40 bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-dark">Locked</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-mute">
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line" aria-hidden>
              <span className="block h-full rounded-full bg-brand" style={{ width: `${REFERENCE.confidence}%` }} />
            </span>
            {REFERENCE.confidence}% confidence <span className="text-mute/70">({confidenceLevel(REFERENCE.confidence)})</span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm">
            {REFERENCE.specs.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-mute">{k}</dt>
                <dd className="font-mono">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-mute">Standard published measurements for this coin.</p>
        </section>

        <section className="rounded-xl border border-line bg-panel p-4" aria-labelledby="meas-h">
          <h2 id="meas-h" className="text-xs font-semibold uppercase tracking-wider text-mute">Detected measurements</h2>
          <ul className="mt-2 grid gap-x-4 sm:grid-cols-2">
            {rows.map((r) => (
              <li key={r.key} className="border-b border-line last:border-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                <button
                  onClick={() => setEditKey(r.key)}
                  onMouseEnter={() => setHoverKey(r.key)}
                  onMouseLeave={() => setHoverKey(null)}
                  onFocus={() => setHoverKey(r.key)}
                  onBlur={() => setHoverKey(null)}
                  className={`-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-panel2 ${
                    hoverKey === r.key ? "bg-brand-soft ring-2 ring-brand/40" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold"
                    style={{ borderColor: SPOTS[r.key].color }}
                  >
                    {SPOTS[r.key].n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.label}</span>
                    <span className="block font-mono text-xs text-mute">{chipText(r)}</span>
                  </span>
                  <Badge kind={r.kind} />
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-mute" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                  <span className="sr-only">Tap to edit</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <EditMeasurementDialog row={editing} onClose={() => setEditKey(null)} onSave={save} />

      <button
        onClick={() => {
          reach(2);
          router.push("/mesh");
        }}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-20 flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-brand-dark md:bottom-6 md:right-6"
      >
        Accept
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m5 12 5 5 9-10" />
        </svg>
      </button>
    </div>
  );
}
