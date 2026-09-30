"use client";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/Badge";
import { Confidence } from "@/components/MeasurementList";
import { fmt, isRadiusRow, type Row } from "@/lib/measurements";

const num = (s: string) => {
  const t = s.trim();
  const n = Number(t);
  return t && Number.isFinite(n) && n > 0 ? n : null;
};

const field = "mt-1 w-full rounded-lg border bg-bg px-3 py-2.5 font-mono text-base outline-none focus:border-brand";

function EditForm({ row, onClose, onSave }: { row: Row; onClose: () => void; onSave: (key: string, value: string) => void }) {
  const radius = isRadiusRow(row.key);
  const [primary, setPrimary] = useState(fmt(Number(row.value)));
  const [diameter, setDiameter] = useState(radius ? fmt(Number(row.value) * 2) : "");
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const n = num(primary);
    if (n === null) return setError("Enter a number greater than 0");
    onSave(row.key, n.toFixed(2));
  };
  const border = error ? "border-bad" : "border-line";

  return (
    <form
      className="p-5"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold">{row.label}{radius ? " size" : ""}</h2>
        <Badge kind={row.kind} />
      </div>
      <div className="mt-1.5"><Confidence row={row} /></div>
      <p className="mt-1 text-xs text-mute">{row.note}</p>

      {radius ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="edit-radius" className="block text-sm font-medium">Radius (mm)</label>
            <input
              id="edit-radius"
              autoFocus
              value={primary}
              inputMode="decimal"
              aria-invalid={!!error}
              onChange={(e) => {
                setPrimary(e.target.value);
                setError(null);
                const n = num(e.target.value);
                setDiameter(n === null ? "" : fmt(n * 2));
              }}
              className={`${field} ${border}`}
            />
          </div>
          <div>
            <label htmlFor="edit-diameter" className="block text-sm font-medium">Diameter (mm)</label>
            <input
              id="edit-diameter"
              value={diameter}
              inputMode="decimal"
              onChange={(e) => {
                setDiameter(e.target.value);
                setError(null);
                const n = num(e.target.value);
                setPrimary(n === null ? "" : fmt(n / 2));
              }}
              className={`${field} ${border}`}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <label htmlFor="edit-length" className="block text-sm font-medium">Length (mm)</label>
          <input
            id="edit-length"
            autoFocus
            value={primary}
            inputMode="decimal"
            aria-invalid={!!error}
            onChange={(e) => {
              setPrimary(e.target.value);
              setError(null);
            }}
            className={`${field} ${border}`}
          />
        </div>
      )}
      {error && <p role="alert" className="mt-1 text-xs text-bad">{error}</p>}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={onClose} className="rounded-full border border-line py-2.5 text-sm font-semibold hover:bg-panel2">Cancel</button>
        <button type="submit" className="rounded-full bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Accept</button>
      </div>
    </form>
  );
}

/** Edit one measurement. Gears and the shaft show a linked radius and diameter. */
export function EditMeasurementDialog({
  row, onClose, onSave,
}: { row: Row | null; onClose: () => void; onSave: (key: string, value: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (row && !d.open) d.showModal();
    else if (!row && d.open) d.close();
  }, [row]);

  return (
    <dialog ref={dialog} onClose={onClose} className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-line bg-panel p-0 text-ink shadow-2xl backdrop:bg-black/40">
      {row && <EditForm key={row.key} row={row} onClose={onClose} onSave={onSave} />}
    </dialog>
  );
}
