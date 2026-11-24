import { getAlumni } from "@/lib/publicData";
import AlumniListClient from "./AlumniListClient";

// Prerendered at build; the list refreshes from /api/alumni in the browser.
export const dynamic = "force-static";

export default async function AlumniPage() {
  const alumni = await getAlumni();

  return <AlumniListClient alumni={alumni} />;
}
