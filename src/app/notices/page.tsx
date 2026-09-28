import type { Metadata } from "next";
import { noticesDB } from "@/lib/db";
import { FaBell } from "react-icons/fa";
import NoticeTable from "@/components/notices/NoticeTable";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "নোটিশ বোর্ড | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
};

export default async function NoticesPage() {
  const notices = await noticesDB.getAll();

  return (
    <div>
      {/* Page Banner */}
      <div className="bg-[#051939] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold font-bengali flex items-center gap-2">
            <FaBell className="text-yellow-300" />
            নোটিশ বোর্ড
          </h1>
          <p className="text-gray-300 font-bengali text-sm mt-1">
            প্রচ্ছদ &rsaquo; নোটিশ বোর্ড
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <NoticeTable notices={notices} />
        </div>
      </div>
    </div>
  );
}
