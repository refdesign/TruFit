import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mesh" };

export default function MeshLayout({ children }: { children: React.ReactNode }) {
  return children;
}
