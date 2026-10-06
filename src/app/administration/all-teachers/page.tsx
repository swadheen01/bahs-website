import { teachersDB } from "@/lib/db";
import TeacherListClient from "./TeacherListClient";

export const revalidate = 86400; // 24h ISR, revalidated on-demand when teacher profile updates

export default async function AllTeachersPage() {
  const teachers = await teachersDB.getAll();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <TeacherListClient teachers={teachers as any} />
    </div>
  );
}

