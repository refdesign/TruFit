"use client";
import { useEffect, useState } from "react";
import { INITIAL_ROWS, fmt, type Row } from "./measurements";
import type { Status } from "@/components/MeasurementList";

// Common stocked spur-gear tooth counts (catalog gears).
export const STANDARD_TEETH = [12, 14, 15, 16, 18, 20, 22, 24, 25, 28, 30, 32, 36, 40, 45, 48, 50, 60, 64, 72, 80, 90, 96, 100];

// Objects the gear has to live next to (placeholder values for the demo scene).
// The neighbor is the middle gear on the photo; the new gear goes on the center shaft.
const NEIGHBOR = { teeth: 36, module: 2.4 };
const HOUSING_CLEARANCE = 30.0; // mm of free thickness before the housing

const RANGES = {
  module: [1.5, 4.0],
  thickness: [6.0, 25.0],
  bore: [10.0, 60.0],
  backlash: [0.1, 0.5],
} as const;

export const OVERLAP_MESSAGE = "Proposed measurement overlaps with other objects. Please recalculate.";

/** Fit rows start from the accepted Reconstruct values. */
export function buildFitRows(recon: Row[]): Row[] {
  const shaft = recon.find((r) => r.key === "shaftR")!;
  return [
    { key: "teeth", label: "Tooth count", value: "36", unit: "", decimals: 0, confidence: 81, kind: "inferred", note: "Matched to the neighboring gear" },
    { key: "module", label: "Module", value: "2.40", unit: "mm", decimals: 2, confidence: 78, kind: "inferred", note: "Outer diameter ÷ (teeth + 2)" },
    { key: "thickness", label: "Thickness", value: "19.0", unit: "mm", decimals: 1, confidence: 72, kind: "inferred", note: "Inferred from the neighboring gear's width" },
    {
      key: "bore", label: "Bore diameter", value: (Number(shaft.value) * 2).toFixed(1), unit: "mm", decimals: 1,
      confidence: shaft.confidence, kind: shaft.kind,
      note: shaft.kind === "user" ? `Center shaft diameter, changed by you (${fmt(Number(INITIAL_ROWS.find((r) => r.key === "shaftR")!.value) * 2)} → ${fmt(Number(shaft.value) * 2)} mm)` : "Center shaft diameter, from the reconstruction",
    },
    { key: "backlash", label: "Backlash", value: "0.20", unit: "mm", decimals: 2, confidence: 65, kind: "inferred", note: "Standard clearance for cast-iron gears" },
    { key: "shaft", label: "Shaft distance", value: "86.4", unit: "mm", decimals: 1, confidence: 89, kind: "measured", note: "Center shaft to the neighboring gear" },
  ];
}

export function derive(rows: Row[]) {
  const v = (k: string) => Number(rows.find((r) => r.key === k)!.value);
  const teeth = v("teeth"), m = v("module");
  const pitchR = (m * teeth) / 2;
  return {
    teeth, module: m, thickness: v("thickness"), bore: v("bore"), backlash: v("backlash"), shaft: v("shaft"),
    outerDiameter: m * (teeth + 2),
    pitchDiameter: m * teeth,
    rootDiameter: 2 * (pitchR - 1.25 * m),
    meshDistance: pitchR + (NEIGHBOR.module * NEIGHBOR.teeth) / 2,
  };
}

export function evaluate(rows: Row[], originalTeeth: number) {
  const d = derive(rows);
  const neighborRootR = (NEIGHBOR.module * NEIGHBOR.teeth) / 2 - 1.25 * NEIGHBOR.module;
  const radialOverlap = d.outerDiameter / 2 + neighborRootR > d.shaft;
  const housingOverlap = d.thickness > HOUSING_CLEARANCE;
  const overlap = radialOverlap || housingOverlap;

  const status: Record<string, Status> = {};
  const inRange = (k: keyof typeof RANGES, val: number, unit: string, what: string) => {
    const [lo, hi] = RANGES[k];
    status[k] =
      val >= lo && val <= hi
        ? { level: "ok", text: `Within acceptable range (${lo}–${hi} ${unit})` }
        : { level: "flag", text: `Outside the typical ${what} range (${lo}–${hi} ${unit}). Still buildable.` };
  };

  if (!STANDARD_TEETH.includes(d.teeth))
    status.teeth = { level: "flag", text: `${d.teeth} isn't a standard tooth count. Still buildable, but stock mating gears may not exist.` };
  else if (Math.abs(d.teeth - originalTeeth) / originalTeeth > 0.3)
    status.teeth = { level: "flag", text: `${d.teeth} is a big jump from my ${originalTeeth}. Still buildable, but worth confirming.` };
  else status.teeth = { level: "ok", text: "Standard tooth count" };

  inRange("module", d.module, "mm", "printable module");
  inRange("bore", d.bore, "mm", "bore");
  inRange("backlash", d.backlash, "mm", "backlash");
  inRange("thickness", d.thickness, "mm", "thickness");

  status.shaft =
    Math.abs(d.shaft - d.meshDistance) <= 1
      ? { level: "ok", text: `Matches the mesh distance (${d.meshDistance.toFixed(1)} mm)` }
      : { level: "flag", text: `Mesh distance for these gears is ${d.meshDistance.toFixed(1)} mm. They may bind or skip.` };

  // Overlap is the only true error: mark the rows the user changed (or all involved rows).
  const mark = (keys: string[]) => {
    const edited = keys.filter((k) => rows.find((r) => r.key === k)?.kind === "user");
    for (const k of edited.length ? edited : keys) status[k] = { level: "error", text: "Overlaps other objects" };
  };
  if (radialOverlap) mark(["teeth", "module", "shaft"]);
  if (housingOverlap) mark(["thickness"]);

  return { derived: d, status, overlap };
}

const KEY = "trufit-fit-v4";

/** Fit rows for this browser tab; built from Reconstruct values the first time. */
export function useFitRows(recon: Row[], reconHydrated: boolean) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (!reconHydrated) return;
    try {
      const raw = sessionStorage.getItem(KEY);
      // Hydrate after mount so server and client markup match.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) return setRows(JSON.parse(raw));
    } catch {}
    setRows(buildFitRows(recon));
  }, [reconHydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!rows) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(rows));
    } catch {}
  }, [rows]);

  return { rows, setRows };
}
