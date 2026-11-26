"use client";
import { useEffect, useState } from "react";

/**
 * Pages are prerendered at build time (cheap to serve on Cloudflare). This hook shows that
 * prerendered data immediately, then fetches the latest version from the API once in the browser,
 * so admin changes appear without a redeploy.
 *
 * The API responses are browser-cacheable for 60s, so navigating around the site does not
 * repeat the request. Right after an admin change (see markDataChanged), this browser skips its
 * cache for a while so the admin immediately sees the result of their change.
 */

const CHANGED_KEY = "bahs_data_changed_at";
const CHANGED_WINDOW_MS = 10 * 60 * 1000;

/** Call after a successful admin save so this browser loads fresh public data (no stale cache). */
export function markDataChanged() {
  try {
    localStorage.setItem(CHANGED_KEY, String(Date.now()));
  } catch {}
}

function changedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(CHANGED_KEY));
    return Boolean(at) && Date.now() - at < CHANGED_WINDOW_MS;
  } catch {
    return false;
  }
}

/** Like useFreshData, but also reports `settled` = the live request finished (or failed). */
export function useFreshDataStatus<T>(
  url: string,
  initial: T,
  isValid: (data: any) => boolean = (d) => d !== null && d !== undefined && !d.error
): { data: T; settled: boolean } {
  const [state, setState] = useState<{ data: T; settled: boolean }>({ data: initial, settled: false });

  useEffect(() => {
    let cancelled = false;
    fetch(url, changedRecently() ? { cache: "no-store" } : undefined)
      .then((res) => (res.ok ? res.json() : null))
      .then((fresh) => {
        if (cancelled) return;
        setState((prev) => (isValid(fresh) ? { data: fresh as T, settled: true } : { ...prev, settled: true }));
      })
      .catch(() => {
        if (!cancelled) setState((prev) => ({ ...prev, settled: true }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return state;
}

export function useFreshData<T>(
  url: string,
  initial: T,
  isValid: (data: any) => boolean = (d) => d !== null && d !== undefined && !d.error
): T {
  return useFreshDataStatus(url, initial, isValid).data;
}
