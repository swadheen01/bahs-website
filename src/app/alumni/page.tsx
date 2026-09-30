import { alumniDB } from "@/lib/db";
import Image from "next/image";
import { FaGraduationCap } from "react-icons/fa";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function AlumniPage() {
  const alumni = await alumniDB.getAll();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Page Header */}
      <div className="bg-[#465b6a] pt-12 pb-16 shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-bengali">
            কৃতি শিক্ষার্থীবৃন্দ
          </h1>
          <div className="w-16 h-1 bg-[#06874A] mx-auto mt-4 mb-2 rounded-full"></div>
          <p className="text-gray-200 font-bengali text-sm md:text-base max-w-2xl mx-auto">
            যাঁরা নিজেদের মেধা ও যোগ্যতায় বিভিন্ন ক্ষেত্রে সাফল্যের স্বাক্ষর রেখে চলেছেন, তাঁরা আমাদের গর্ব।
          </p>
          <div className="mt-4">
            <p className="inline-block bg-black/20 text-gray-200 text-xs md:text-sm px-4 py-2 rounded-lg border border-white/10 font-bengali italic">
              <span className="font-bold text-emerald-400">বি.দ্র: </span>
              সকল কৃতি শিক্ষার্থীর নাম একসাথে সংযুক্ত করা সম্ভব হয়নি, তবে তাঁদের সকলের সফলতায় আমরা গর্বিত। এই তালিকাটি পর্যায়ক্রমে আপডেট হতে থাকবে।
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        {alumni.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-md text-center">
            <p className="text-gray-500 font-bengali">কোনো কৃতি শিক্ষার্থীর তথ্য পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {alumni.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-2xl p-5 text-center group transition-all duration-300 hover:-translate-y-2 border border-gray-100 shadow-sm hover:shadow-xl flex flex-col items-center"
              >
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-gray-50 shadow-sm mb-4 group-hover:border-[#06874A] transition-colors duration-300">
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-300">
                    <FaGraduationCap size={40} />
                  </div>
                  {person.photo && (
                    <Image
                      src={person.photo}
                      alt={person.nameBengali}
                      fill
                      className="object-cover relative z-10"
                      sizes="120px"
                    />
                  )}
                </div>
                <h3 className="font-bold text-[#051939] text-base mb-1">
                  {person.nameBengali}
                </h3>
                {person.nameEnglish && (
                  <p className="text-xs text-gray-400 mb-2">{person.nameEnglish}</p>
                )}
                
                <div className="mt-auto pt-3 border-t border-gray-50 w-full">
                  <p className="text-sm font-semibold text-[#06874A]">{person.degree}</p>
                  <p className="text-xs text-gray-500 mt-1">{person.institution}</p>
                  {person.year && (
                    <p className="text-[10px] text-gray-400 mt-1 bg-gray-50 inline-block px-2 py-0.5 rounded-full">
                      Batch: {person.year}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
