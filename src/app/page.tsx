import { getHomeData } from "@/lib/publicData";
import HomeClient from "./HomeClient";

// Prerendered at build time and served from the static cache on Cloudflare (no per-visit rendering).
// HomeClient refreshes the data from /api/home in the browser.
export const dynamic = "force-static";

export default async function Page() {
  const initialData = await getHomeData();
  return <HomeClient initialData={initialData} />;
}
