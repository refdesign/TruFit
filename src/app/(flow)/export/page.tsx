"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/Badge";
import { OVERLAP_MESSAGE, buildFitRows, derive, evaluate, useFitRows } from "@/lib/fit";
import { downloadGear, type ExportFormat } from "@/lib/gearMesh";
import { useMeasurements } from "@/lib/measurements";

const FORMATS: { format: ExportFormat; name: string; blurb: string }[] = [
  { format: "stl", name: "STL", blurb: "The standard for 3D printing" },
  { format: "obj", name: "OBJ", blurb: "Widely supported mesh format" },
  { format: "ply", name: "PLY", blurb: "Mesh and scan tools" },
  { format: "glb", name: "GLB", blurb: "Web and AR viewers" },
];

const DISCLOSURE = "Mesh matches measured and inferred real-world dimensions, but real-world fit depends on other tolerances.";

export default function ExportPage() {
  const { rows: recon, hydrated } = useMeasurements();
  const { rows } = useFitRows(recon, hydrated);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  // An unresolved overlap on Fit blocks export.
  const overlap = useMemo(() => {
    if (!rows) return false;
    const teeth = Number(buildFitRows(recon).find((r) => r.key === "teeth")!.value);
    return evaluate(rows, teeth).overlap;
  }, [rows, recon]);

  // The disclosure is shown every time this screen opens.
  useEffect(() => {
    if (rows && !overlap && !accepted && !dialog.current?.open) dialog.current?.showModal();
  }, [rows, overlap, accepted]);

  const d = useMemo(() => (rows ? derive(rows) : null), [rows]);
  const groups = useMemo(() => {
    const by = { measured: [] as string[], inferred: [] as string[], user: [] as string[] };
    rows?.forEach((r) => by[r.kind].push(r.label.toLowerCase()));
    return by;
  }, [rows]);

  if (!rows || !d) return <div className="min-h-[50vh]" />;

  const download = async (format: ExportFormat) => {
    setBusy(format);
    try {
      await downloadGear(d, format);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-4 text-sm text-mute">
        {overlap ? (
          <span className="font-bold text-ink">Your gear can&apos;t be exported yet.</span>
        ) : (
          <>
            <span className="font-bold text-ink">Your gear is ready to export.</span> Choose a file format to download.
          </>
        )}
      </p>

      {overlap ? (
        <div role="alert" className="rounded-xl border border-bad/50 bg-bad/10 p-5">
          <p className="flex gap-2.5 text-sm font-medium text-bad">
            <span aria-hidden>✕</span>
            <span>{OVERLAP_MESSAGE}</span>
          </p>
          <Link href="/fit" className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            Back to Fit
          </Link>
        </div>
      ) : accepted ? (
        <>
          <ul aria-label="File formats" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FORMATS.map((f) => (
              <li key={f.format}>
                <button
                  onClick={() => download(f.format)}
                  disabled={busy !== null}
                  className="flex h-full w-full flex-col items-center gap-2 rounded-xl border border-line bg-panel px-3 py-5 text-center transition-colors hover:border-brand hover:bg-brand-soft disabled:opacity-60"
                >
                  <span className="grid h-14 w-12 place-items-center rounded-md border-2 border-brand-dark text-sm font-bold text-brand-dark" aria-hidden>
                    .{f.format}
                  </span>
                  <span className="text-base font-semibold">
                    {f.name}
                    <span className="sr-only"> download</span>
                  </span>
                  <span className="text-xs text-mute">{busy === f.format ? "Preparing…" : f.blurb}</span>
                </button>
              </li>
            ))}
          </ul>

          <section className="mt-5 rounded-xl border border-line bg-panel p-4" aria-labelledby="sum-h">
            <h2 id="sum-h" className="text-xs font-semibold uppercase tracking-wider text-mute">What&apos;s in the file</h2>
            <p className="mt-1 text-sm">
              Spur gear · {d.teeth} teeth · module {d.module.toFixed(2)} mm · {d.thickness} mm thick · {d.bore} mm bore. Units are millimeters.
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {(["measured", "inferred", "user"] as const).map(
                (k) =>
                  groups[k].length > 0 && (
                    <li key={k} className="flex flex-wrap items-center gap-2">
                      <Badge kind={k} />
                      <span>{groups[k].join(", ")}</span>
                    </li>
                  ),
              )}
            </ul>
          </section>
        </>
      ) : (
        <div className="grid min-h-[40vh] place-items-center rounded-xl border border-dashed border-line text-sm">
          <button onClick={() => dialog.current?.showModal()} className="font-medium text-brand-dark underline underline-offset-2 hover:text-brand">
            Accept the notice to see download options.
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-mute">{DISCLOSURE}</p>

      <dialog
        ref={dialog}
        onCancel={(e) => e.preventDefault()}
        aria-labelledby="disclosure-h"
        className="m-auto w-[min(92vw,30rem)] rounded-2xl border border-line bg-panel p-0 text-ink shadow-2xl backdrop:bg-black/50"
      >
        <div className="p-5 sm:p-6">
          <h2 id="disclosure-h" className="text-lg font-semibold">Before you download</h2>
          <div className="mt-3 space-y-3 text-sm">
            <p>{DISCLOSURE}</p>
            <p>
              TruFit can&apos;t promise the printed part will fit. I can tell you what was measured versus inferred, not how it will behave once printed. Compare against a spare part, or print a test piece first.
            </p>
            <ul className="space-y-1.5 rounded-lg bg-panel2 p-3">
              {(["measured", "inferred", "user"] as const).map(
                (k) =>
                  groups[k].length > 0 && (
                    <li key={k} className="flex flex-wrap items-center gap-2">
                      <Badge kind={k} />
                      <span>{groups[k].join(", ")}</span>
                    </li>
                  ),
              )}
            </ul>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link href="/fit" className="rounded-full border border-line py-2.5 text-center text-sm font-semibold hover:bg-panel2">
              Back to Fit
            </Link>
            <button
              onClick={() => {
                setAccepted(true);
                dialog.current?.close();
              }}
              className="rounded-full bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Accept
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
