"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/progress";

export const STEPS = [
  { key: "capture", label: "Capture", icon: "M4 8a2 2 0 0 1 2-2h1.5l1-1.5h5L14.5 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Zm7 7.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" },
  { key: "reconstruct", label: "Reconstruct", icon: "M11 3 4 6.5v9L11 19l7-3.5v-9L11 3Zm0 0v8m0 0L4 6.5M11 11l7-4.5" },
  { key: "mesh", label: "Mesh", icon: "M4 4h14v14H4V4Zm0 7h14M11 4v14M4 4l14 14" },
  { key: "fit", label: "Fit", icon: "M4 8V4h4M14 4h4v4M18 14v4h-4M8 18H4v-4M8 8h6v6H8V8Z" },
  { key: "export", label: "Export", icon: "M11 3v10m0 0-3.5-3.5M11 13l3.5-3.5M4 15v3h14v-3" },
] as const;

function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

const FOLDER = "M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h6.5A1.5 1.5 0 0 1 19 8.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 16.5v-10Z";
const USER = "M11 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-7 8c0-3.3 3.1-6 7-6s7 2.7 7 6";

function ProjectsMenu() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="projects-menu"
        className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink hover:bg-panel2"
      >
        <Icon d={FOLDER} />
        <span className="hidden sm:inline">Projects</span>
        <span className="sr-only sm:hidden">Projects</span>
        <svg viewBox="0 0 24 24" className={`hidden h-4 w-4 text-mute transition-transform sm:block ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div id="projects-menu" className="absolute right-0 top-full z-40 mt-1 w-56 rounded-xl border border-line bg-panel p-4 text-sm text-mute shadow-lg">
          No projects
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const path = usePathname();
  const reached = useProgress();
  const current = path.split("/")[1] || "capture";
  const idx = STEPS.findIndex((s) => s.key === current);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-panel/95 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-[1500px] grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[1fr_auto_1fr] md:px-6">
          {/* Left: logo */}
          <Link href="/" className="justify-self-start" aria-label="TruFit home">
            <Image src="/trufit-logo.webp" alt="TruFit" width={1776} height={890} priority className="h-9 w-auto md:h-11" />
          </Link>

          {/* Center: step guide (desktop) */}
          <nav aria-label="Workflow steps" className="hidden md:col-start-2 md:row-start-1 md:block">
            <ol className="flex items-center gap-1">
              {STEPS.map((s, i) => {
                const active = i === idx;
                const done = i < reached;
                const locked = i > reached;
                const body = (
                  <>
                    <span
                      aria-hidden
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        active ? "bg-white/20" : done ? "bg-brand text-white" : "border border-line bg-panel"
                      }`}
                    >
                      {done && !active ? "✓" : i + 1}
                    </span>
                    {s.label}
                    {done && !active && <span className="sr-only"> (completed)</span>}
                    {locked && <span className="sr-only"> (locked until you reach this step)</span>}
                  </>
                );
                return (
                  <li key={s.key} className="flex items-center gap-1">
                    {i > 0 && <span aria-hidden className={`h-px w-4 lg:w-8 ${i <= reached ? "bg-brand" : "bg-line"}`} />}
                    {locked ? (
                      <span aria-disabled="true" className="flex cursor-not-allowed items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm text-mute/50">
                        {body}
                      </span>
                    ) : (
                      <Link
                        href={`/${s.key}`}
                        aria-current={active ? "step" : undefined}
                        className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm transition-colors ${
                          active ? "bg-brand font-medium text-white" : "text-mute hover:bg-panel2 hover:text-ink"
                        }`}
                      >
                        {body}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Right: Projects + user */}
          <div className="flex items-center gap-2 justify-self-end md:col-start-3 md:row-start-1">
            <ProjectsMenu />
            <button aria-label="Account" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-brand-soft text-brand-dark hover:border-brand">
              <Icon d={USER} />
            </button>
          </div>
        </div>
      </header>

      {/* App view: bottom tab bar */}
      <nav aria-label="Workflow steps" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel pb-[env(safe-area-inset-bottom)] md:hidden">
        <ol className="grid grid-cols-5">
          {STEPS.map((s, i) => {
            const active = i === idx;
            const locked = i > reached;
            const body = (
              <>
                <span className={`flex h-7 w-12 items-center justify-center rounded-full ${active ? "bg-brand-soft" : ""}`}>
                  <Icon d={s.icon} />
                </span>
                {s.label}
                {locked && <span className="sr-only"> (locked until you reach this step)</span>}
              </>
            );
            return (
              <li key={s.key}>
                {locked ? (
                  <span aria-disabled="true" className="flex cursor-not-allowed flex-col items-center gap-0.5 py-2 text-[11px] text-mute/45">
                    {body}
                  </span>
                ) : (
                  <Link
                    href={`/${s.key}`}
                    aria-current={active ? "step" : undefined}
                    className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "font-semibold text-brand" : "text-mute"}`}
                  >
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
