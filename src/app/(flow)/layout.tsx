import { Nav } from "@/components/Nav";
import { ProgressGuard } from "@/components/ProgressGuard";

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div role="note" className="border-b border-brand/20 bg-brand-soft px-4 py-1.5 text-center text-xs text-brand-dark">
        <strong className="font-bold">Demo mode:</strong> photos, reconstruction and 3D placement are simulated with sample data.
      </div>
      <ProgressGuard />
      <Nav />
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-8">{children}</main>
    </>
  );
}
