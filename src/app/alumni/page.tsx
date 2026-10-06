import { alumniDB } from "@/lib/db";
import AlumniListClient from "./AlumniListClient";

export const revalidate = 86400; // 24h ISR, revalidated on-demand when alumni list updates

export default async function AlumniPage() {
  const alumni = await alumniDB.getAll();

  return <AlumniListClient alumni={alumni} />;
}

