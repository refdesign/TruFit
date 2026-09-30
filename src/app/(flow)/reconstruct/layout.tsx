import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reconstruct" };

export default function ReconstructLayout({ children }: { children: React.ReactNode }) {
  return children;
}
