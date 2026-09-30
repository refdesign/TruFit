"use client";
import { useEffect, useState } from "react";

export type Kind = "measured" | "inferred" | "user";
export type Row = {
  key: string;
  label: string;
  value: string;
  unit: string;
  decimals: number;
  confidence: number;
  kind: Kind;
  note: string;
};

// Placeholder detections for the gearbox scene. Gears and the shaft store their radius (mm);
// shaft lengths store the length (mm). Order matches the numbered pins on the image.
const MEASURED = "Compared against the quarter's diameter";
const r = (key: string, label: string, value: string, confidence: number, note = MEASURED, kind: Kind = "measured"): Row => ({
  key, label, value, unit: "mm", decimals: 2, confidence, kind, note,
});

export const INITIAL_ROWS: Row[] = [
  r("orange", "Small gear", "19.05", 90),
  r("left", "Left gear", "50.8", 93),
  r("lenLeft", "Left shaft length", "95.25", 88, "Shaft tip to gear face"),
  r("red", "Middle gear", "44.45", 94),
  r("shaftR", "Center shaft", "19.05", 91, "Target shaft: the new gear goes here"),
  r("lenCenter", "Center shaft length", "76.2", 90, "Target shaft: shaft tip to housing"),
  r("purple", "Upper-right gear", "38.1", 92),
  r("yellow", "Small upper-right gear", "19.05", 89),
  r("right", "Right gear", "63.5", 95),
];

/** Trim to at most two decimals: 19.05, 38.1, 127. */
export const fmt = (n: number) => String(Number(n.toFixed(2)));

/** Radius-type rows show a linked radius and diameter; length rows show a single value. */
export const isRadiusRow = (key: string) => !key.startsWith("len");

export const REFERENCE = {
  name: "US quarter",
  confidence: 98,
  specs: [
    ["Diameter", "24.26 mm"],
    ["Thickness", "1.75 mm"],
  ],
} as const;

const KEY = "trufit-measurements-v3";

/** Measurements shared across screens, kept in sessionStorage for this browser tab. */
export function useMeasurements() {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      // Hydrate after mount so server and client markup match.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setRows(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(rows));
    } catch {}
  }, [rows, hydrated]);

  return { rows, setRows, hydrated };
}
