import { teachersDB } from "@/lib/db";
import TeacherListClient from "./TeacherListClient";

export const dynamic = 'force-dynamic';

export default async function AllTeachersPage() {
  const teachers = await teachersDB.getAll();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Page Header */}
      <div className="bg-[#465b6a] pt-12 pb-20 shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-bengali">
            সকল শিক্ষকমণ্ডলী
          </h1>
          <div className="w-16 h-1 bg-[#06874A] mx-auto mt-4 mb-2 rounded-full"></div>
          <p className="text-gray-200 font-bengali text-sm md:text-base">
            বানিয়াচং আদর্শ উচ্চ বিদ্যালয় — মোট {teachers.length} জন
          </p>
        </div>
      </div>

      {/* Search + Grid — client side */}
      <div className="-mt-8">
        <TeacherListClient teachers={teachers as any} />
      </div>
    </div>
  );
}
