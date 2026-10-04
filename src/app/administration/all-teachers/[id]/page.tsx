import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TeacherDetailsClient from "./TeacherDetailsClient";

export const revalidate = 86400;

export default async function TeacherDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: teacher } = await supabase.from('teachers').select('*').eq('id', id).single();

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

