import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description = "Replacement parts, sized from photos. Measured vs. inferred, always labeled.";

export const metadata: Metadata = {
  metadataBase: new URL("https://tru-fit-sigma.vercel.app"),
  title: { default: "TruFit - Capture and 3D Fitting", template: "%s · TruFit" },
  description,
  openGraph: { title: "TruFit - Capture and 3D Fitting", description, siteName: "TruFit", type: "website" },
  twitter: { card: "summary_large_image", title: "TruFit - Capture and 3D Fitting", description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
