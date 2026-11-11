import { teachersDB } from "@/lib/db";
import TeacherListClient from "./TeacherListClient";

export const dynamic = "force-dynamic";

export default async function AllTeachersPage() {
  const teachers = await teachersDB.getAll();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <TeacherListClient teachers={teachers as any} />
    </div>
  );
}

