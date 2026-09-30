"use client";
import { INITIAL_ROWS } from "@/lib/measurements";
import { PLACEMENT, SCENE, SPOTS } from "@/lib/scene";

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const labelFor = (key: string) => INITIAL_ROWS.find((r) => r.key === key)?.label ?? key;

/**
 * The wireframe reconstruction. `dim` greys it out to focus a preview; `targets` shows tappable
 * rings (no measurements) for the placement step.
 */
export function EnvironmentScene({
  dim = false, targets = false, onPick, children,
}: { dim?: boolean; targets?: boolean; onPick?: (key: string) => void; children?: React.ReactNode }) {
  const rings = Object.entries(SPOTS).filter(([, s]) => s.ring);
  return (
    <section aria-label="Reconstructed scene" className="overflow-hidden rounded-xl border border-line bg-panel">
      <div className="relative aspect-[3/2] w-full bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SCENE.wireframe}
          alt="Wireframe reconstruction of the machine"
          className={`absolute inset-0 h-full w-full object-cover transition-[filter] duration-300 ${dim ? "brightness-[.4] saturate-50" : ""}`}
        />

        {targets && (
          <>
            <svg viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} className="absolute inset-0 h-full w-full" aria-hidden>
              {rings.map(([k, s]) => {
                const target = k === PLACEMENT.targetKey;
                return (
                  <g key={k} opacity={target ? 1 : 0.55}>
                    <circle cx={s.ring!.x} cy={s.ring!.y} r={s.ring!.r} fill="none" stroke="#000" strokeOpacity="0.75" strokeWidth="7" />
                    <circle
                      cx={s.ring!.x} cy={s.ring!.y} r={s.ring!.r} fill={target ? s.color : "none"} fillOpacity="0.18"
                      stroke={s.color} strokeWidth={target ? 5 : 3} strokeDasharray="9 6" className={target ? "animate-pulse" : ""}
                    />
                  </g>
                );
              })}
            </svg>
            {rings.map(([k, s]) => (
              <button
                key={k}
                onClick={() => onPick?.(k)}
                aria-label={k === PLACEMENT.targetKey ? `${labelFor(k)}: place the gear here` : labelFor(k)}
                className="absolute rounded-full transition-colors hover:bg-white/15 focus-visible:outline-offset-0"
                style={{ left: pct(s.ring!.x - s.ring!.r, SCENE.w), top: pct(s.ring!.y - s.ring!.r, SCENE.h), width: pct(s.ring!.r * 2, SCENE.w), height: pct(s.ring!.r * 2, SCENE.h) }}
              />
            ))}
          </>
        )}

        {children}
      </div>
      <div className="border-t border-line px-4 py-2.5 text-xs text-mute">Wireframe reconstruction · 5 photos combined</div>
    </section>
  );
}
