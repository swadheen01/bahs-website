import { alumniDB } from "@/lib/db";
import AlumniListClient from "./AlumniListClient";

export const dynamic = "force-dynamic";

export default async function AlumniPage() {
  const alumni = await alumniDB.getAll();

  return <AlumniListClient alumni={alumni} />;
}

