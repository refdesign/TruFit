import * as THREE from "three";

export type GearSpec = { teeth: number; module: number; bore: number; thickness: number; backlash: number };

export type ExportFormat = "stl" | "obj" | "ply" | "glb";

/** Extruded spur gear in millimetres, thickness along Z, centered at the origin. */
export function buildGearMesh(g: GearSpec) {
  const pitchR = (g.module * g.teeth) / 2;
  const tipR = pitchR + g.module;
  const rootR = pitchR - 1.25 * g.module;
  const step = (Math.PI * 2) / g.teeth;
  const shave = g.backlash / (2 * pitchR); // radians removed from each tooth flank

  const pts: [number, number][] = [];
  for (let i = 0; i < g.teeth; i++) {
    const c = i * step;
    const w = Math.max(0.05, step * 0.3 - shave);
    const t = Math.max(0.02, step * 0.14 - shave);
    for (const [r, a] of [
      [rootR, c - w],
      [tipR, c - t],
      [tipR, c + t],
      [rootR, c + w],
    ] as const)
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const shape = new THREE.Shape();
  shape.moveTo(...pts[0]);
  pts.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, g.bore / 2, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: g.thickness, bevelEnabled: false, curveSegments: 32 });
  geo.translate(0, 0, -g.thickness / 2);
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
}

const MIME: Record<ExportFormat, string> = {
  stl: "model/stl",
  obj: "text/plain",
  ply: "application/octet-stream",
  glb: "model/gltf-binary",
};

async function serialize(mesh: THREE.Mesh, format: ExportFormat): Promise<BlobPart> {
  switch (format) {
    case "stl": {
      const { STLExporter } = await import("three/examples/jsm/exporters/STLExporter.js");
      return new STLExporter().parse(mesh, { binary: true }).buffer;
    }
    case "obj": {
      const { OBJExporter } = await import("three/examples/jsm/exporters/OBJExporter.js");
      return new OBJExporter().parse(mesh);
    }
    case "ply": {
      const { PLYExporter } = await import("three/examples/jsm/exporters/PLYExporter.js");
      return new Promise<BlobPart>((resolve) => {
        new PLYExporter().parse(mesh, (res) => resolve(res as ArrayBuffer), { binary: true });
      });
    }
    case "glb": {
      const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
      return (await new GLTFExporter().parseAsync(mesh, { binary: true })) as ArrayBuffer;
    }
  }
}

export async function downloadGear(g: GearSpec, format: ExportFormat) {
  const mesh = buildGearMesh(g);
  const data = await serialize(mesh, format);
  mesh.geometry.dispose();
  const url = URL.createObjectURL(new Blob([data], { type: MIME[format] }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `trufit-gear-${g.teeth}t-m${g.module.toFixed(2)}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
