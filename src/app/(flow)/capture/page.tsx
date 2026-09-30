"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { reach } from "@/lib/progress";

type Photo = { src: string; name: string };
type View = "front" | "top" | "right" | "left" | "bottom" | "more";
type Bucket = { id: string; view: View; label: string; photo: Photo | null };

const MIN_PHOTOS = 3;

const LABELS: Record<View, string> = { front: "Front", top: "Top", right: "Right", left: "Left", bottom: "Bottom", more: "More" };

const initial: Bucket[] = [
  ...(["front", "top", "right", "left", "bottom"] as const).map((v) => ({ id: v, view: v as View, label: LABELS[v], photo: null })),
  { id: "more-1", view: "more", label: "More", photo: null },
];

// Demo photo set: one click fills the matching buckets.
const SAMPLE_SET: { view: View; label: string; photo: Photo }[] = [
  { view: "front", label: "Front", photo: { src: "/samples/gearbox-front.png", name: "Front view of the machine" } },
  { view: "top", label: "Top", photo: { src: "/samples/gearbox-top.png", name: "Top view of the machine, with a quarter for scale" } },
  { view: "right", label: "Right", photo: { src: "/samples/gearbox-right.png", name: "Right view of the machine" } },
  { view: "left", label: "Left", photo: { src: "/samples/gearbox-left.png", name: "Left view of the machine" } },
  { view: "more", label: "Detail", photo: { src: "/samples/gearbox-detail.png", name: "Close-up of the shaft, with a quarter for scale" } },
];

export default function CapturePage() {
  const router = useRouter();
  const [buckets, setBuckets] = useState<Bucket[]>(initial);
  const dialog = useRef<HTMLDialogElement>(null);
  const counter = useRef(1);

  const open = () => dialog.current?.showModal();
  const close = () => dialog.current?.close();

  // Keep exactly one empty "More" bucket at the end; number the More buckets.
  const normalize = (list: Bucket[]) => {
    const fixed = list.filter((b) => b.view !== "more");
    const mores = list.filter((b) => b.view === "more" && b.photo);
    counter.current += 1;
    const empty: Bucket = { id: `more-${counter.current}`, view: "more", label: "More", photo: null };
    return [...fixed, ...mores.map((b, i) => ({ ...b, label: `More ${i + 1}` })), { ...empty, label: mores.length ? `More ${mores.length + 1}` : "More" }];
  };

  const addSampleSet = () => {
    setBuckets((prev) => {
      let next = prev;
      for (const s of SAMPLE_SET) {
        if (s.view === "more") {
          const target = next.find((b) => b.view === "more" && !b.photo);
          next = next.map((b) => (b === target ? { ...b, photo: s.photo } : b));
        } else next = next.map((b) => (b.view === s.view ? { ...b, photo: s.photo } : b));
      }
      return normalize(next);
    });
    close();
  };

  const remove = (id: string) => setBuckets((prev) => normalize(prev.map((b) => (b.id === id ? { ...b, photo: null } : b))));

  const filled = buckets.filter((b) => b.photo).length;

  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-xl border border-line bg-panel p-5 md:p-6">
        <h1 className="text-sm font-bold leading-snug">
          To begin, upload images of your target environment. More images lead to better accuracy.
        </h1>
        <p className="mt-2 flex gap-1.5 text-sm text-mute">
          <span aria-hidden className="font-semibold text-brand">*</span>
          Place a ruler or common objects (coins, credit card, etc) in the environment.
        </p>
      </section>

      <div className="mt-2 flex items-center justify-between px-1 pt-4 text-sm text-mute">
        <h2 className="font-medium text-ink">
          Photos <span className="font-normal text-mute">(Minimum 3)</span>
        </h2>
        <span aria-live="polite">{filled} added</span>
      </div>

      <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {buckets.map((b) => (
          <li key={b.id} className="relative">
            <button
              onClick={open}
              aria-label={b.photo ? `${b.label} photo added. Replace` : `Add ${b.label} photo`}
              className={`group relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-xl border text-sm transition-colors ${
                b.photo ? "border-line" : "border-dashed border-mute/50 bg-panel text-mute hover:border-brand hover:bg-brand-soft hover:text-brand-dark"
              }`}
            >
              {b.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.photo.src} alt={b.photo.name} className="h-full w-full object-cover" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="mb-1 h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="font-medium">{b.label}</span>
                  <span className="text-xs opacity-80">Add photo</span>
                </>
              )}
              {b.photo && <span className="absolute bottom-1.5 left-1.5 rounded bg-black/65 px-1.5 py-0.5 text-xs text-white">{b.label}</span>}
            </button>
            {b.photo && (
              <button
                onClick={() => remove(b.id)}
                aria-label={`Remove ${b.label} photo`}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white hover:bg-bad"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          reach(1);
          router.push("/reconstruct");
        }}
        disabled={filled < MIN_PHOTOS}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-20 flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-mute disabled:shadow-none md:bottom-6 md:right-6"
      >
        Submit
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14m-5-5 5 5-5 5" />
        </svg>
        {filled < MIN_PHOTOS && <span className="sr-only"> (add at least {MIN_PHOTOS} photos first)</span>}
      </button>

      <dialog ref={dialog} className="m-auto w-[min(92vw,34rem)] rounded-2xl border border-line bg-panel p-0 text-ink shadow-2xl backdrop:bg-black/40">
        <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Add photos</h2>
                <p className="mt-0.5 text-sm text-mute">Demo mode: add the sample photo set.</p>
              </div>
              <button onClick={close} aria-label="Close" className="rounded-full p-1.5 text-mute hover:bg-panel2">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <button
              onClick={addSampleSet}
              className="mt-4 block w-full overflow-hidden rounded-xl border border-line text-left hover:border-brand focus-visible:border-brand"
            >
              <span className="grid grid-cols-3 gap-1 bg-panel2 p-1">
                {SAMPLE_SET.map((s) => (
                  <span key={s.view + s.label} className="relative block aspect-[4/3] overflow-hidden rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.photo.src} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-0.5 left-0.5 rounded bg-black/65 px-1 text-[10px] text-white">{s.label}</span>
                  </span>
                ))}
              </span>
              <span className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-sm font-medium">Industrial gearbox · {SAMPLE_SET.length} photos</span>
                <span className="text-xs font-semibold text-brand-dark">Add all</span>
              </span>
            </button>
        </div>
      </dialog>
    </div>
  );
}
