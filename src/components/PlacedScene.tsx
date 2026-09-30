import { SCENE, SPOTS } from "@/lib/scene";

// Placeholder for the "mesh placed in the environment" image: a translucent gear over the photo,
// centered on the target shaft and scaled from the scene's mm-per-pixel estimate.
export function PlacedScene({
  teeth, module, bore, overlap,
}: { teeth: number; module: number; bore: number; overlap: boolean }) {
  const k = 1 / SCENE.mmPerPx;
  const { x: cx, y: cy } = SPOTS.shaftR.ring!;
  const pitchR = (module * teeth) / 2;
  const tip = (pitchR + module) * k;
  const root = (pitchR - 1.25 * module) * k;
  const step = (Math.PI * 2) / teeth;
  const pt = (r: number, a: number) => `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`;
  const points = Array.from({ length: teeth }, (_, i) => {
    const c = i * step;
    return [pt(root, c - step * 0.3), pt(tip, c - step * 0.14), pt(tip, c + step * 0.14), pt(root, c + step * 0.3)].join(" ");
  }).join(" ");
  const color = overlap ? "#ff4d4d" : "#22e0d0";

  return (
    <section aria-label="Mesh placed in the environment" className="overflow-hidden rounded-xl border border-line bg-panel">
      <div className="relative aspect-[3/2] w-full bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SCENE.wireframe} alt="Wireframe reconstruction of the machine with the new gear placed on the center shaft" className="absolute inset-0 h-full w-full object-cover" />
        <svg viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} className="absolute inset-0 h-full w-full" aria-hidden>
          <polygon points={points} fill={color} fillOpacity="0.3" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx={cx} cy={cy} r={Math.max(2, (bore / 2) * k)} fill="#0e0c09" fillOpacity="0.6" stroke={color} strokeWidth="2" />
        </svg>
        <span
          className={`absolute left-2 top-2 rounded-md px-2 py-1 text-[11px] font-semibold text-white shadow sm:text-xs ${overlap ? "bg-bad" : "bg-brand"}`}
        >
          {overlap ? "Overlap detected" : "Gear mesh · placed and calibrated"}
        </span>
      </div>
      <div className="border-t border-line px-4 py-2.5 text-xs text-mute">Wireframe reconstruction · {teeth} teeth, module {module.toFixed(2)} mm</div>
    </section>
  );
}
