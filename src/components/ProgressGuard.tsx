"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { STEPS } from "@/components/Nav";
import { readProgress } from "@/lib/progress";

/** Sends the user back to the furthest step they've reached if they open a later one by URL. */
export function ProgressGuard() {
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    const idx = STEPS.findIndex((s) => s.key === path.split("/")[1]);
    const reached = readProgress();
    if (idx > reached) router.replace(`/${STEPS[reached].key}`);
  }, [path, router]);
  return null;
}
