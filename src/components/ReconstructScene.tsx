"use client";
import { fmt, isRadiusRow, type Row } from "@/lib/measurements";
import { QUARTER, SCENE, SPOTS } from "@/lib/scene";

const px = (v: number, of: number) => `${(v / of) * 100}%`;

export function chipText(row: Row) {
  const v = Number(row.value);
  const text = isRadiusRow(row.key) ? `R ${fmt(v)} · Ø ${fmt(v * 2)} mm` : `${fmt(v)} mm`;
  return row.kind === "user" ? `${text} ✎` : text;
}

/** The photo with tappable measurement overlays. Chips on wider screens, numbered pins on phones. */
export function ReconstructScene({
  rows, onSelect, onHover, activeKey,
}: { rows: Row[]; onSelect: (key: string) => void; onHover?: (key: string | null) => void; activeKey?: string | null }) {
  return (
    <section aria-label="Reconstructed scene" className="overflow-hidden rounded-xl border border-line bg-panel">
      <div className="relative aspect-[3/2] w-full bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SCENE.wireframe} alt="Wireframe reconstruction of the machine with its gears and shafts marked for measurement" className="absolute inset-0 h-full w-full object-cover" />

        <svg viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            {Object.entries(SPOTS).map(([k, s]) => (
              <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M0 0 10 5 0 10z" fill={s.color} />
              </marker>
            ))}
          </defs>
          {Object.entries(SPOTS).map(([k, s]) => (
            <g key={k} opacity={activeKey && activeKey !== k ? 0.45 : 1}>
              {/* Dark halo under each mark keeps it readable on any background. */}
              {s.ring && <circle cx={s.ring.x} cy={s.ring.y} r={s.ring.r} fill="none" stroke="#000" strokeOpacity="0.75" strokeWidth="7" />}
              {s.ring && <circle cx={s.ring.x} cy={s.ring.y} r={s.ring.r} fill={activeKey === k ? s.color : "none"} fillOpacity="0.2" stroke={s.color} strokeWidth={activeKey === k ? 5 : 3} strokeDasharray="9 6" />}
              {s.line && <line x1={s.line.x1} y1={s.line.y1} x2={s.line.x2} y2={s.line.y2} stroke="#000" strokeOpacity="0.75" strokeWidth="7" strokeLinecap="round" />}
              {s.line && (
                <line x1={s.line.x1} y1={s.line.y1} x2={s.line.x2} y2={s.line.y2} stroke={s.color} strokeWidth={activeKey === k ? 5 : 3} markerStart={`url(#arrow-${k})`} markerEnd={`url(#arrow-${k})`} />
              )}
            </g>
          ))}
          {/* The scale reference: a drawn quarter on the ledge, where it sat in the photos. */}
          <circle cx={QUARTER.x} cy={QUARTER.y} r={QUARTER.r + 6} fill="none" stroke="#000" strokeOpacity="0.75" strokeWidth="7" />
          <circle cx={QUARTER.x} cy={QUARTER.y} r={QUARTER.r} fill="#9fd0ff" fillOpacity="0.4" stroke="#d6e9ff" strokeWidth="2" />
          <circle cx={QUARTER.x} cy={QUARTER.y} r={QUARTER.r * 0.68} fill="none" stroke="#d6e9ff" strokeOpacity="0.75" strokeWidth="1.2" />
          <circle cx={QUARTER.x} cy={QUARTER.y} r={QUARTER.r + 6} fill="none" stroke="#4d9bff" strokeWidth="3" strokeDasharray="6 4" />
        </svg>

        <span
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-md bg-measured px-1.5 py-1 text-[10px] font-semibold text-white shadow sm:px-2 sm:text-xs"
          style={{ left: px(QUARTER.chip.x, SCENE.w), top: px(QUARTER.chip.y, SCENE.h) }}
        >
          <span aria-hidden>🔒</span> US quarter · Ø 24.26 mm
        </span>

        {rows.map((row) => {
          const s = SPOTS[row.key];
          if (!s) return null;
          return (
            <div key={row.key} className="contents">
              {s.ring && (
                <button
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => onSelect(row.key)}
                  onMouseEnter={() => onHover?.(row.key)}
                  onMouseLeave={() => onHover?.(null)}
                  className="absolute rounded-full transition-colors hover:bg-white/15"
                  style={{ left: px(s.ring.x - s.ring.r, SCENE.w), top: px(s.ring.y - s.ring.r, SCENE.h), width: px(s.ring.r * 2, SCENE.w), height: px(s.ring.r * 2, SCENE.h) }}
                />
              )}
              <button
                tabIndex={-1}
                aria-hidden
                onClick={() => onSelect(row.key)}
                  onMouseEnter={() => onHover?.(row.key)}
                  onMouseLeave={() => onHover?.(null)}
                className={`absolute hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border-2 py-1 pl-1.5 pr-2 text-xs font-semibold text-white shadow transition-transform hover:bg-black sm:flex ${activeKey === row.key ? "z-10 scale-110 bg-black" : "bg-black/80"}`}
                style={{ left: px(s.chip.x, SCENE.w), top: px(s.chip.y, SCENE.h), borderColor: s.color }}
              >
                <span className="grid h-4 w-4 place-items-center rounded-full border text-[10px] font-bold" style={{ borderColor: s.color }}>
                  {s.n}
                </span>
                {chipText(row)}
              </button>
              <button
                tabIndex={-1}
                aria-hidden
                onClick={() => onSelect(row.key)}
                  onMouseEnter={() => onHover?.(row.key)}
                  onMouseLeave={() => onHover?.(null)}
                className={`absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-[11px] font-bold text-white sm:hidden ${activeKey === row.key ? "z-10 scale-125 bg-black" : "bg-black/80"}`}
                style={{ left: px(s.chip.x, SCENE.w), top: px(s.chip.y, SCENE.h), borderColor: s.color }}
              >
                {s.n}
              </button>
            </div>
          );
        })}
      </div>
      <div className="border-t border-line px-4 py-2.5 text-xs text-mute">Wireframe reconstruction · 5 photos combined. Tap any measurement to edit it.</div>
    </section>
  );
}
