"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MeasurementList } from "@/components/MeasurementList";
import { PlacedScene } from "@/components/PlacedScene";
import { OVERLAP_MESSAGE, buildFitRows, evaluate, useFitRows } from "@/lib/fit";
import { useMeasurements } from "@/lib/measurements";
import { reach } from "@/lib/progress";

export default function FitPage() {
  const router = useRouter();
  const { rows: recon, hydrated } = useMeasurements();
  const { rows, setRows } = useFitRows(recon, hydrated);
  const [anyDirty, setAnyDirty] = useState(false);

  const original = useMemo(() => (hydrated ? buildFitRows(recon) : null), [hydrated, recon]);
  const originalTeeth = original ? Number(original.find((r) => r.key === "teeth")!.value) : 36;
  const result = useMemo(() => (rows ? evaluate(rows, originalTeeth) : null), [rows, originalTeeth]);

  if (!rows || !result || !original) return <div className="min-h-[50vh]" />;
  const { derived: d, status, overlap } = result;

  const commit = (key: string, value: string) =>
    setRows((rs) => {
      if (!rs) return rs;
      // A new tooth count keeps the measured outer diameter, so the module absorbs the change.
      const oldTeeth = Number(rs.find((r) => r.key === "teeth")!.value);
      const outerDiameter = Number(rs.find((r) => r.key === "module")!.value) * (oldTeeth + 2);
      return rs.map((r) => {
        if (key === "teeth" && r.key === "module") return { ...r, value: (outerDiameter / (Number(value) + 2)).toFixed(2) };
        if (r.key !== key) return r;
        const was = original.find((o) => o.key === key)!;
        if (value === was.value) return was;
        return { ...r, value, kind: "user", note: `You replaced the calculated value (${was.value}${was.unit && ` ${was.unit}`})` };
      });
    });

  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-4 text-sm text-mute">
        <span className="font-bold text-ink">Your gear is placed and calibrated to the scene.</span> Review the calculated measurements and change any you know better.
      </p>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_380px]">
        <PlacedScene teeth={d.teeth} module={d.module} bore={d.bore} overlap={overlap} />

        <div className="space-y-4">
          {overlap && (
            <div role="alert" className="flex gap-2.5 rounded-xl border border-bad/50 bg-bad/10 px-4 py-3 text-sm font-medium text-bad">
              <span aria-hidden>✕</span>
              <span>{OVERLAP_MESSAGE}</span>
            </div>
          )}

          <section className="rounded-xl border border-line bg-panel p-4" aria-labelledby="calc-h">
            <h2 id="calc-h" className="text-xs font-semibold uppercase tracking-wider text-mute">Calculated measurements</h2>
            <MeasurementList rows={rows} status={status} onCommit={commit} onDirtyChange={setAnyDirty} />
            <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-sm">
              <div>
                <dt className="text-xs text-mute">Outer diameter</dt>
                <dd className="font-mono">{d.outerDiameter.toFixed(1)} mm</dd>
              </div>
              <div>
                <dt className="text-xs text-mute">Pitch diameter</dt>
                <dd className="font-mono">{d.pitchDiameter.toFixed(1)} mm</dd>
              </div>
              <div>
                <dt className="text-xs text-mute">Root diameter</dt>
                <dd className="font-mono">{d.rootDiameter.toFixed(1)} mm</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <button
        onClick={() => {
          reach(4);
          router.push("/export");
        }}
        disabled={anyDirty || overlap}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-20 flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-mute disabled:shadow-none md:bottom-6 md:right-6"
      >
        Accept
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m5 12 5 5 9-10" />
        </svg>
        {overlap ? <span className="sr-only"> (resolve the overlap first)</span> : anyDirty && <span className="sr-only"> (submit or revert your edits first)</span>}
      </button>
    </div>
  );
}
