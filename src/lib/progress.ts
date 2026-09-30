"use client";
import { useSyncExternalStore } from "react";

// How far the user has gotten (index into the five steps). Later steps stay locked until reached.
const KEY = "trufit-progress-v1";
const EVENT = "trufit-progress";

export function readProgress() {
  try {
    return Number(sessionStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Unlock a step (never moves backwards). Call before navigating to it. */
export function reach(step: number) {
  if (step <= readProgress()) return;
  try {
    sessionStorage.setItem(KEY, String(step));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useProgress() {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener(EVENT, notify);
      return () => window.removeEventListener(EVENT, notify);
    },
    readProgress,
    () => 0,
  );
}
