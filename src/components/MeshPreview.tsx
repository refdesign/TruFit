// Static stand-in for the chosen mesh: a translucent gear over the render. Not fitted or interactive.
const TEETH = 24;
const POINTS = Array.from({ length: TEETH }, (_, i) => {
  const step = (Math.PI * 2) / TEETH;
  const c = i * step;
  const p = (r: number, a: number) => `${(100 + Math.cos(a) * r).toFixed(2)},${(100 + Math.sin(a) * r).toFixed(2)}`;
  return [p(74, c - step * 0.32), p(92, c - step * 0.16), p(92, c + step * 0.16), p(74, c + step * 0.32)].join(" ");
}).join(" ");

export function MeshPreview({
  x = 50, y = 50, w = 52, glide = false, label = true,
}: { x?: number; y?: number; w?: number; glide?: boolean; label?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        viewBox="0 0 200 200"
        className="absolute h-auto drop-shadow-lg"
        style={{
          left: `${x}%`, top: `${y}%`, width: `${w}%`, transform: "translate(-50%, -50%)",
          transition: glide ? "left .9s cubic-bezier(.4,0,.2,1), top .9s cubic-bezier(.4,0,.2,1), width .9s cubic-bezier(.4,0,.2,1)" : undefined,
        }}
        role="img"
        aria-label="Preview of the selected mesh"
      >
        <polygon points={POINTS} fill="#22d3c5" fillOpacity="0.55" stroke="#9af5ec" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="100" cy="100" r="58" fill="none" stroke="#9af5ec" strokeOpacity="0.6" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="22" fill="#0e1c1b" fillOpacity="0.7" stroke="#9af5ec" strokeWidth="2" />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i;
          return <line key={i} x1={100 + Math.cos(a) * 22} y1={100 + Math.sin(a) * 22} x2={100 + Math.cos(a) * 58} y2={100 + Math.sin(a) * 58} stroke="#9af5ec" strokeOpacity="0.5" strokeWidth="1.5" />;
        })}
      </svg>
      {label && <span className="absolute left-2 top-2 rounded-md bg-brand px-2 py-1 text-[11px] font-semibold text-white shadow sm:text-xs">Mesh preview</span>}
    </div>
  );
}
