import { getTeachers } from "@/lib/publicData";
import TeacherListClient from "./TeacherListClient";

// Prerendered at build; the list refreshes from /api/teachers in the browser.
export const dynamic = "force-static";

export default async function AllTeachersPage() {
  const teachers = await getTeachers();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <TeacherListClient teachers={teachers as any} />
    </div>
  );
}
