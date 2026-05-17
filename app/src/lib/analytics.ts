// Lightweight, privacy-safe event tracking for the public lead-magnet tools.
// Backed by Plausible (https://plausible.io) — no cookies, no personal data.
//
// Activation: set NEXT_PUBLIC_PLAUSIBLE_DOMAIN on Vercel (e.g. volt-spark.vercel.app).
// Until then, track() is a harmless no-op — nothing breaks, nothing is sent.
//
// The Plausible snippet installs a queue stub, so events fired before the
// script finishes loading are buffered, not lost.

type EventProps = Record<string, string | number | boolean>;

interface PlausibleFn {
  (event: string, options?: { props?: EventProps }): void;
  q?: unknown[];
}

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

/**
 * Fire a named analytics event. Safe to call anywhere on the client;
 * server-side calls and unconfigured environments are silently ignored.
 */
export function track(event: string, props?: EventProps): void {
  if (typeof window === 'undefined') return;
  const p = window.plausible;
  if (typeof p === 'function') {
    p(event, props ? { props } : undefined);
  }
}
