import Link from "next/link";
import { getTeacherRow, getTeachers } from "@/lib/publicData";
import TeacherDetailsClient from "./TeacherDetailsClient";

// Every existing teacher profile is prerendered at build time and served from cache.
// A teacher added after the last deploy is rendered on demand until the next deploy.
export const dynamicParams = true;

export async function generateStaticParams() {
  const teachers = await getTeachers();
  return teachers.filter((t) => t && t.id).map((t) => ({ id: String(t.id) }));
}

export default async function TeacherDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teacher = await getTeacherRow(id);

  if (!teacher) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl text-gray-500 font-bengali mb-4">শিক্ষকের তথ্য পাওয়া যায়নি</h2>
        <Link href="/administration/all-teachers" className="text-blue-600 hover:underline">← ফিরে যান</Link>
      </div>
    );
  }

  return <TeacherDetailsClient teacher={teacher} />;
}
