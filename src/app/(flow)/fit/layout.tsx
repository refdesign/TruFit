import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fit" };

export default function FitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
