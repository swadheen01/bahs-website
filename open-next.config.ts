import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Cloudflare free plan = 10ms CPU per request.
 *
 * - `staticAssetsIncrementalCache`: pages prerendered at build time are stored in Workers static
 *   assets (free) and served from there. Without it OpenNext used a "dummy" cache, so EVERY page view
 *   re-ran React server rendering, which is what kept exceeding the CPU limit.
 * - `enableCacheInterception`: answer those prerendered pages before the Next.js server is even
 *   loaded, so a page view costs only a cache read.
 *
 * Fresh data (notices, sliders, teachers...) is still loaded by the browser from the API after the
 * page appears, so admin changes show up without redeploying.
 */
export default {
  ...defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
    enableCacheInterception: true,
  }),
  buildCommand: "npm run build:next",
};
