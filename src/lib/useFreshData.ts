"use client";
import { useEffect, useState } from "react";

/**
 * Pages are prerendered at build time (cheap to serve on Cloudflare). This hook shows that
 * prerendered data immediately, then fetches the latest version from the API once in the browser,
 * so admin changes appear without a redeploy.
 *
 * The API responses are browser-cacheable for 60s, so navigating around the site does not
 * repeat the request.
 */
export function useFreshData<T>(
  url: string,
  initial: T,
  isValid: (data: any) => boolean = (d) => d !== null && d !== undefined && !d.error
): T {
  const [data, setData] = useState<T>(initial);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((fresh) => {
        if (!cancelled && isValid(fresh)) setData(fresh as T);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return data;
}
