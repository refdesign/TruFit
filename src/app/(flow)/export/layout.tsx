import type { Metadata } from "next";

export const metadata: Metadata = { title: "Export" };

export default function ExportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
