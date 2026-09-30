// Overlay geometry for /samples/gearbox-front.png, in that image's pixel space (900 x 600).
export const SCENE = {
  src: "/samples/gearbox-front.png",
  wireframe: "/samples/reconstruct-wireframe.png", // same 3:2 framing; Reconstruct uses this
  w: 900,
  h: 600,
  mmPerPx: 0.68,
};

export type Spot = {
  n: number; // pin number, matches the list order
  color: string;
  ring?: { x: number; y: number; r: number };
  line?: { x1: number; y1: number; x2: number; y2: number };
  chip: { x: number; y: number }; // label center
};

export const SPOTS: Record<string, Spot> = {
  orange: { n: 1, color: "#ff8a2b", ring: { x: 300, y: 236, r: 24 }, chip: { x: 215, y: 250 } },
  left: { n: 2, color: "#6ee04a", ring: { x: 228, y: 310, r: 78 }, chip: { x: 110, y: 300 } },
  lenLeft: { n: 3, color: "#6ee04a", line: { x1: 250, y1: 318, x2: 182, y2: 398 }, chip: { x: 250, y: 425 } },
  red: { n: 4, color: "#ff5252", ring: { x: 370, y: 312, r: 70 }, chip: { x: 372, y: 218 } },
  shaftR: { n: 5, color: "#6ee04a", ring: { x: 497, y: 315, r: 32 }, chip: { x: 497, y: 236 } },
  lenCenter: { n: 6, color: "#6ee04a", line: { x1: 505, y1: 330, x2: 540, y2: 380 }, chip: { x: 600, y: 420 } },
  purple: { n: 7, color: "#b26bff", ring: { x: 575, y: 218, r: 58 }, chip: { x: 575, y: 128 } },
  yellow: { n: 8, color: "#ffc93c", ring: { x: 662, y: 192, r: 33 }, chip: { x: 742, y: 150 } },
  right: { n: 9, color: "#2ed3ff", ring: { x: 678, y: 318, r: 90 }, chip: { x: 800, y: 210 } },
};

export const QUARTER = { x: 489, y: 432, r: 17, chip: { x: 489, y: 476 } };

// Mesh placement: the preview starts large and centered, then glides onto the target shaft.
export const PLACEMENT = {
  targetKey: "shaftR",
  start: { x: 50, y: 50, w: 52 }, // % of the image (center x, center y, width)
  end: { x: (497 / 900) * 100 + 0.6, y: (315 / 600) * 100 - 0.8, w: 17 }, // slightly rough; Fit calibrates it
};
