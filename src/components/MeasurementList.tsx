"use client";
import { Fragment, useRef, useState } from "react";
import { Badge } from "@/components/Badge";
import type { Row } from "@/lib/measurements";

export type Status = { level: "ok" | "flag" | "error"; text: string };

export const confidenceLevel = (c: number) => (c >= 85 ? "High" : c >= 70 ? "Medium" : "Low");

// Returns the normalized value string, or an error message.
export function parseValue(row: Row, raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const t = raw.trim();
  const n = Number(t);
  if (!t || !Number.isFinite(n) || n <= 0) return { ok: false, error: "Enter a number greater than 0" };
  if (row.decimals === 0 && !Number.isInteger(n)) return { ok: false, error: "Enter a whole number" };
  return { ok: true, value: n.toFixed(row.decimals) };
}

export function Confidence({ row }: { row: Row }) {
  if (row.kind === "user") return <span className="text-xs text-mute">Entered by you</span>;
  return (
    <div className="flex items-center gap-2 text-xs text-mute">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line" aria-hidden>
        <span className="block h-full rounded-full bg-brand" style={{ width: `${row.confidence}%` }} />
      </span>
      <span>
        {row.confidence}% confidence <span className="text-mute/70">({confidenceLevel(row.confidence)})</span>
      </span>
    </div>
  );
}

const STATUS = {
  ok: { icon: "✓", label: "OK", cls: "text-mute" },
  flag: { icon: "⚑", label: "Flag", cls: "text-[#a4520a]" },
  error: { icon: "✕", label: "Error", cls: "font-medium text-bad" },
} as const;

function StatusLine({ status }: { status?: Status }) {
  if (!status) return null;
  const s = STATUS[status.level];
  return (
    <p className={`mt-1 flex gap-1.5 text-xs ${s.cls}`}>
      <span aria-hidden>{s.icon}</span>
      <span>
        <span className="sr-only">{s.label}: </span>
        {status.text}
      </span>
    </p>
  );
}

function DesktopRow({ row, status, onCommit, onDirty }: { row: Row; status?: Status; onCommit: (v: string) => void; onDirty: (d: boolean) => void }) {
  const [draft, setDraft] = useState(row.value);
  const [error, setError] = useState<string | null>(null);
  const dirty = draft.trim() !== row.value;
  const id = `field-${row.key}`;

  const change = (v: string) => {
    setDraft(v);
    setError(null);
    onDirty(v.trim() !== row.value);
  };
  const submit = () => {
    const r = parseValue(row, draft);
    if (!r.ok) return setError(r.error);
    onCommit(r.value);
    setDraft(r.value);
    onDirty(false);
  };
  const revert = () => {
    setDraft(row.value);
    setError(null);
    onDirty(false);
  };

  return (
    <li className="hidden py-3 md:block">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">{row.label}</label>
        <span className="flex items-center gap-2">
          <span className={`flex items-center rounded-md border bg-bg px-2 focus-within:border-brand ${error || status?.level === "error" ? "border-bad" : "border-line"}`}>
            <input
              id={id}
              value={draft}
              inputMode="decimal"
              aria-invalid={!!error || status?.level === "error"}
              aria-describedby={error ? `${id}-err` : undefined}
              onChange={(e) => change(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") revert();
              }}
              className="w-20 bg-transparent py-1.5 text-right font-mono text-sm outline-none"
            />
            {row.unit && <span className="pl-1 text-xs text-mute">{row.unit}</span>}
          </span>
          <Badge kind={row.kind} />
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-xs text-mute">{row.note}</span>
        <Confidence row={row} />
      </div>
      <StatusLine status={status} />
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-right text-xs text-bad">{error}</p>}
      {dirty && (
        <div className="mt-2 flex justify-end">
          <button onClick={submit} className="rounded-md bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark">
            Submit
          </button>
        </div>
      )}
    </li>
  );
}

function MobileRow({ row, status, onOpen }: { row: Row; status?: Status; onOpen: () => void }) {
  return (
    <li className="md:hidden">
      <button onClick={onOpen} className="-mx-2 block w-[calc(100%+1rem)] rounded-lg px-2 py-3 text-left hover:bg-panel2 active:bg-panel2">
        <span className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">{row.label}</span>
          <span className="flex items-center gap-2">
            <span className={`font-mono text-sm ${status?.level === "error" ? "text-bad" : ""}`}>
              {row.value}
              {row.unit && ` ${row.unit}`}
            </span>
            <Badge kind={row.kind} />
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-mute" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9 6 6 6-6 6" />
            </svg>
          </span>
        </span>
        <span className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-xs text-mute">{row.note}</span>
          <Confidence row={row} />
        </span>
        <span className="block"><StatusLine status={status} /></span>
        <span className="sr-only">Tap to edit</span>
      </button>
    </li>
  );
}

/**
 * Editable measurement rows. Desktop: text boxes with a small Submit on change.
 * Phone: tap a row to edit it in a dialog. Committed edits are reported via onCommit.
 */
export function MeasurementList({
  rows, status, onCommit, onDirtyChange,
}: {
  rows: Row[];
  status?: Record<string, Status>;
  onCommit: (key: string, value: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const dirtyRef = useRef<Record<string, boolean>>({});
  const [editKey, setEditKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const editing = rows.find((r) => r.key === editKey) ?? null;

  const setRowDirty = (key: string, d: boolean) => {
    dirtyRef.current = { ...dirtyRef.current, [key]: d };
    onDirtyChange?.(Object.values(dirtyRef.current).some(Boolean));
  };
  const openEdit = (r: Row) => {
    setEditKey(r.key);
    setDraft(r.value);
    setError(null);
    dialog.current?.showModal();
  };
  const closeEdit = () => {
    dialog.current?.close();
    setEditKey(null);
  };
  const accept = () => {
    if (!editing) return;
    const r = parseValue(editing, draft);
    if (!r.ok) return setError(r.error);
    onCommit(editing.key, r.value);
    closeEdit();
  };

  return (
    <>
      <ul className="mt-1 divide-y divide-line">
        {rows.map((r) => (
          <Fragment key={`${r.key}-${r.value}`}>
            <MobileRow row={r} status={status?.[r.key]} onOpen={() => openEdit(r)} />
            <DesktopRow row={r} status={status?.[r.key]} onCommit={(v) => onCommit(r.key, v)} onDirty={(d) => setRowDirty(r.key, d)} />
          </Fragment>
        ))}
      </ul>

      <dialog ref={dialog} onClose={() => setEditKey(null)} className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-line bg-panel p-0 text-ink shadow-2xl backdrop:bg-black/40">
        {editing && (
          <form
            className="p-5"
            onSubmit={(e) => {
              e.preventDefault();
              accept();
            }}
          >
            <h2 className="text-base font-semibold">Edit {editing.label.toLowerCase()}</h2>
            <p className="mt-0.5 text-sm text-mute">Currently {editing.value}{editing.unit && ` ${editing.unit}`} ({editing.kind === "user" ? "user input" : editing.kind}).</p>
            <label htmlFor="edit-value" className="mt-4 block text-sm font-medium">{editing.label}{editing.unit && ` (${editing.unit})`}</label>
            <input
              id="edit-value"
              autoFocus
              value={draft}
              inputMode="decimal"
              aria-invalid={!!error}
              onChange={(e) => {
                setDraft(e.target.value);
                setError(null);
              }}
              className={`mt-1 w-full rounded-lg border bg-bg px-3 py-2.5 font-mono text-base outline-none focus:border-brand ${error ? "border-bad" : "border-line"}`}
            />
            {error && <p role="alert" className="mt-1 text-xs text-bad">{error}</p>}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={closeEdit} className="rounded-full border border-line py-2.5 text-sm font-semibold hover:bg-panel2">Cancel</button>
              <button type="submit" className="rounded-full bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Accept</button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
