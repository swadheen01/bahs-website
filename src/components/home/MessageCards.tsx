import Image from "next/image";
import Link from "next/link";
import schoolInfo from "@/data/school-info.json";
import { FaQuoteLeft } from "react-icons/fa";

export default function MessageCards() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* President's Message */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-[#A53146]">
            <div className="bg-[#A53146] text-white px-4 py-2.5">
              <h2 className="font-bold font-bengali text-lg">সভাপতির বাণী</h2>
            </div>
            <div className="p-5 flex gap-4">
              <div className="shrink-0">
                <div className="relative w-20 h-24 rounded overflow-hidden bg-gray-200 border-2 border-[#A53146]">
                  <Image
                    src={schoolInfo.presidentMessage.photo}
                    alt={schoolInfo.presidentMessage.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-bengali text-center p-1">
                    ছবি
                  </div>
                </div>
                <p className="text-center text-xs font-bengali mt-1 text-gray-600 font-medium">
                  {schoolInfo.presidentMessage.name}
                </p>
              </div>
              <div className="flex-1">
                <FaQuoteLeft className="text-[#A53146] mb-1" />
                <p className="text-sm text-gray-700 font-bengali leading-relaxed line-clamp-5">
                  {schoolInfo.presidentMessage.message}
                </p>
                <Link
                  href="/about#president"
                  className="inline-block mt-2 text-xs text-[#A53146] font-bengali font-medium hover:underline"
                >
                  বিস্তারিত →
                </Link>
              </div>
            </div>
          </div>

          {/* Headmaster's Message */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-[#06874A]">
            <div className="bg-[#06874A] text-white px-4 py-2.5">
              <h2 className="font-bold font-bengali text-lg">প্রধান শিক্ষকের বাণী</h2>
            </div>
            <div className="p-5 flex gap-4">
              <div className="shrink-0">
                <div className="relative w-20 h-24 rounded overflow-hidden bg-gray-200 border-2 border-[#06874A]">
                  <Image
                    src={schoolInfo.headmasterMessage.photo}
                    alt={schoolInfo.headmasterMessage.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-bengali text-center p-1">
                    ছবি
                  </div>
                </div>
                <p className="text-center text-xs font-bengali mt-1 text-gray-600 font-medium">
                  {schoolInfo.headmasterMessage.name}
                </p>
                <p className="text-center text-[10px] font-bengali text-gray-500">
                  {schoolInfo.headmasterMessage.designation}
                </p>
              </div>
              <div className="flex-1">
                <FaQuoteLeft className="text-[#06874A] mb-1" />
                <p className="text-sm text-gray-700 font-bengali leading-relaxed line-clamp-5">
                  {schoolInfo.headmasterMessage.message}
                </p>
                <Link
                  href="/about#headmaster"
                  className="inline-block mt-2 text-xs text-[#06874A] font-bengali font-medium hover:underline"
                >
                  বিস্তারিত →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
