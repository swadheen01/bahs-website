import type { Metadata } from "next";
import { noticesDB } from "@/lib/db";
import { FaBell, FaFilePdf } from "react-icons/fa";

export const dynamic = "force-dynamic";

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

      <div className="container mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600 font-bengali">
              মোট নোটিশ: <strong>{notices.length}টি</strong>
            </p>
          </div>

          {/* Notice Table */}
          <div className="overflow-x-auto">
            {notices.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-bengali">
                বর্তমানে কোনো নোটিশ প্রকাশিত নেই।
              </div>
            ) : (
              <table className="w-full text-sm font-bengali">
                <thead>
                  <tr className="bg-[#051939] text-white">
                    <th className="px-4 py-3 text-left w-16">ক্রমিক</th>
                    <th className="px-4 py-3 text-left w-32">তারিখ</th>
                    <th className="px-4 py-3 text-left">নোটিশ</th>
                    <th className="px-4 py-3 text-center w-24">ডাউনলোড</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map((notice, i) => (
                    <tr
                      key={notice.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{notice.date}</td>
                      <td className="px-4 py-3 text-[#051939]">
                        <span className="flex items-center gap-2">
                          {notice.isNew && (
                            <span className="inline-block bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0">
                              নতুন
                            </span>
                          )}
                          {notice.title}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {notice.fileUrl ? (
                          <a
                            href={notice.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                            title="PDF ডাউনলোড করুন"
                          >
                            <FaFilePdf size={18} />
                          </a>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
