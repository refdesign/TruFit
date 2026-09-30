"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EnvironmentScene } from "@/components/EnvironmentScene";
import { MeshPreview } from "@/components/MeshPreview";
import { reach } from "@/lib/progress";
import { PLACEMENT } from "@/lib/scene";

type Mode = "library" | "upload";

const OPTIONS: { mode: Mode; label: string }[] = [
  { mode: "library", label: "Library" },
  { mode: "upload", label: "Upload" },
];

// Demo files: users can't upload real meshes.
const SAMPLE_FILES = [
  { name: "gear_18t_m1.8.stl", size: "212 KB" },
  { name: "replacement_gear.obj", size: "340 KB" },
  { name: "crank_handle.stl", size: "148 KB" },
  { name: "shaft_collar.3mf", size: "96 KB" },
];

const FILE_ICON = "M7 3h7l5 5v13H7V3Zm7 0v5h5";

const GEAR_POINTS = Array.from({ length: 10 }, (_, i) => {
  const step = (Math.PI * 2) / 10;
  const c = i * step;
  const p = (r: number, a: number) => `${(32 + Math.cos(a) * r).toFixed(2)},${(32 + Math.sin(a) * r).toFixed(2)}`;
  return [p(17, c - step * 0.32), p(24, c - step * 0.16), p(24, c + step * 0.16), p(17, c + step * 0.32)].join(" ");
}).join(" ");

const HEX_POINTS = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i;
  return `${(32 + Math.cos(a) * 25).toFixed(2)},${(32 + Math.sin(a) * 25).toFixed(2)}`;
}).join(" ");

// Library parts, drawn as simple side/top views (64x64 grid).
const PARTS: { name: string; shape: React.ReactNode }[] = [
  {
    name: "Screw",
    shape: (
      <>
        <path d="M12 14a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v2H12v-2ZM26 16v30l6 8 6-8V16" />
        <path d="M26 24l12 4M26 31l12 4M26 38l12 4" />
        <path d="M18 13h10" />
      </>
    ),
  },
  {
    name: "Bolt",
    shape: (
      <>
        <path d="M22 8h20l6 8-6 8H22l-6-8 6-8Z" transform="translate(0 -2)" />
        <path d="M26 22v34h12V22" />
        <path d="M26 30h12M26 36h12M26 42h12M26 48h12" />
      </>
    ),
  },
  {
    name: "Nut",
    shape: (
      <>
        <polygon points={HEX_POINTS} />
        <circle cx="32" cy="32" r="9" />
        <circle cx="32" cy="32" r="18" strokeWidth="1" />
      </>
    ),
  },
  {
    name: "Washer",
    shape: (
      <>
        <circle cx="32" cy="32" r="22" />
        <circle cx="32" cy="32" r="9" />
      </>
    ),
  },
  {
    name: "Gear",
    shape: (
      <>
        <polygon points={GEAR_POINTS} />
        <circle cx="32" cy="32" r="8" />
      </>
    ),
  },
  {
    name: "Dowel",
    shape: (
      <>
        <path d="M22 10v40c0 3 4.5 5 10 5s10-2 10-5V10" />
        <ellipse cx="32" cy="10" rx="10" ry="5" />
      </>
    ),
  },
];

export default function MeshPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [part, setPart] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const selected = mode === "library" ? part : mode === "upload" ? fileName : null;

  // choose -> place (tap a shaft) -> placing (gliding) -> placed (Continue)
  const [stage, setStage] = useState<"choose" | "place" | "placing" | "placed">("choose");
  const [pos, setPos] = useState<{ x: number; y: number; w: number }>(PLACEMENT.start);
  const [hint, setHint] = useState("");

  const pickTarget = (key: string) => {
    if (stage !== "place") return;
    if (key !== PLACEMENT.targetKey) {
      setHint("In this demo, the gear goes on the center shaft. Tap the pulsing ring.");
      return;
    }
    setHint("");
    setPos(PLACEMENT.start);
    setStage("placing");
    setTimeout(() => {
      setPos(PLACEMENT.end);
      setTimeout(() => setStage("placed"), 950);
    }, 60);
  };
  const changeMesh = () => {
    setStage("choose");
    setPos(PLACEMENT.start);
    setHint("");
  };

  const pick = (mode: Mode) => {
    setMode(mode);
    if (mode === "upload") dialog.current?.showModal();
  };
  const choose = (name: string) => {
    setFileName(name);
    dialog.current?.close();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm font-bold text-ink">
        {stage === "choose"
          ? "Select a mesh from the library or upload your own."
          : stage === "place"
            ? "Tap the shaft where your gear should go."
            : stage === "placing"
              ? "Placing your gear…"
              : "Your gear is in place. Continue to let TruFit calibrate the fit."}
      </p>

      <div role="group" aria-label="Mesh source" className={`mb-4 mt-3 justify-center gap-3 ${stage === "choose" ? "flex" : "hidden"}`}>
        {OPTIONS.map((o) => {
          const active = mode === o.mode;
          return (
            <button
              key={o.mode}
              onClick={() => pick(o.mode)}
              aria-pressed={active}
              className={`rounded-full border px-6 py-2 text-sm font-semibold transition-colors ${
                active ? "border-brand bg-brand text-white" : "border-brand text-brand-dark hover:bg-brand-soft"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <div className={`mx-auto max-w-3xl ${stage === "choose" ? "" : "mt-3"}`}>
        <div className="space-y-3">
          <EnvironmentScene dim={stage === "choose" && !!selected} targets={stage === "place"} onPick={pickTarget}>
            {stage === "choose" && selected && <MeshPreview />}
            {(stage === "placing" || stage === "placed") && <MeshPreview x={pos.x} y={pos.y} w={pos.w} glide label={false} />}
          </EnvironmentScene>

          {stage === "place" && (
            <p role="status" className="min-h-5 text-center text-xs text-mute">
              {hint || "Highlighted rings mark the machine's parts."}
            </p>
          )}

          {stage !== "choose" && (
            <div className="flex justify-center">
              <button onClick={changeMesh} className="text-sm font-medium text-brand-dark underline underline-offset-2 hover:text-brand">
                Change mesh
              </button>
            </div>
          )}

          {stage === "choose" && selected && (
            <p role="note" className="flex gap-2 rounded-lg bg-panel2 px-3 py-2 text-xs text-mute">
              <span aria-hidden className="font-bold text-brand-dark">ⓘ</span>
              <span>
                <span className="font-semibold text-ink">Demo note:</span> whichever mesh you choose, this prototype continues with a gear.
              </span>
            </p>
          )}

          {stage === "choose" && mode === "upload" && fileName && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={FILE_ICON} />
                </svg>
                <span className="truncate text-sm font-medium" title={fileName}>
                  <span className="sr-only">Selected file: </span>
                  {fileName}
                </span>
              </div>
              <button
                onClick={() => setStage("place")}
                className="shrink-0 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Submit
              </button>
            </div>
          )}

          {stage === "choose" && mode === "library" && (
            <>
            <ul aria-label="Mesh library" className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {PARTS.map((p) => {
                const active = part === p.name;
                return (
                  <li key={p.name}>
                    <button
                      onClick={() => setPart(p.name)}
                      aria-pressed={active}
                      className={`flex w-full flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-colors ${
                        active ? "border-brand bg-brand-soft" : "border-line bg-panel hover:border-brand hover:bg-brand-soft"
                      }`}
                    >
                      <svg viewBox="0 0 64 64" className="h-14 w-14 text-brand-dark" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        {p.shape}
                      </svg>
                      <span className="text-sm font-medium">{p.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-center pt-1">
              <button
                onClick={() => setStage("place")}
                disabled={!part}
                className="rounded-full bg-brand px-8 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-mute"
              >
                Submit
                {!part && <span className="sr-only"> (select a part first)</span>}
              </button>
            </div>
            </>
          )}
        </div>
      </div>

      {stage === "placed" && (
        <button
          onClick={() => {
            reach(3);
            router.push("/fit");
          }}
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-20 flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-brand-dark md:bottom-6 md:right-6"
        >
          Continue
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </button>
      )}

      {/* Dummy file selector */}
      <dialog ref={dialog} className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-line bg-panel p-0 text-ink shadow-2xl backdrop:bg-black/40">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Select a mesh file</h2>
              <p className="mt-0.5 text-sm text-mute">Demo mode: choose one of the sample files.</p>
            </div>
            <button onClick={() => dialog.current?.close()} aria-label="Close" className="rounded-full p-1.5 text-mute hover:bg-panel2">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {SAMPLE_FILES.map((f) => (
              <li key={f.name}>
                <button onClick={() => choose(f.name)} className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-brand-soft focus-visible:bg-brand-soft">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-mute" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={FILE_ICON} />
                  </svg>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.name}</span>
                  <span className="text-xs text-mute">{f.size}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </div>
  );
}
