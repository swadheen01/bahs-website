"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { FaUserCircle, FaSearch, FaTimes } from "react-icons/fa";

interface Teacher {
  id: number;
  nameBengali: string;
  nameEnglish: string;
  designation: string;
  subject: string;
  photo: string;
  category: string;
}

export default function TeacherListClient({ teachers }: { teachers: Teacher[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) =>
      t.nameBengali?.toLowerCase().includes(q) ||
      t.nameEnglish?.toLowerCase().includes(q) ||
      t.designation?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q)
    );
  }, [query, teachers]);

  return (
    <>
      {/* Search Box */}
      <div className="container mx-auto px-4 mt-8 mb-2">
        <div className="max-w-xl mx-auto relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম, পদবি বা বিষয় দিয়ে খুঁজুন..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 shadow-md bg-white text-gray-800 font-bengali text-sm focus:outline-none focus:ring-2 focus:ring-[#06874A] focus:border-transparent placeholder:text-gray-400 transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              aria-label="Clear search"
            >
              <FaTimes size={15} />
            </button>
          )}
        </div>
        {query && (
          <p className="text-center text-sm text-gray-500 font-bengali mt-2">
            {filtered.length === 0
              ? `"${query}" এর জন্য কোনো শিক্ষক পাওয়া যায়নি`
              : `${filtered.length} জন শিক্ষক পাওয়া গেছে`}
          </p>
        )}
      </div>

      {/* Teachers Grid */}
      <div className="container mx-auto px-4 mt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FaUserCircle size={60} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-bengali text-lg">কোনো শিক্ষক পাওয়া যায়নি</p>
            <button
              onClick={() => setQuery("")}
              className="mt-3 text-[#06874A] font-bengali text-sm hover:underline"
            >
              সকল শিক্ষকমণ্ডলী দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((teacher) => (
              <Link
                key={teacher.id}
                href={`/administration/all-teachers/${teacher.id}`}
                className="group relative bg-white rounded-2xl p-3 sm:p-3.5 border-2 border-slate-200/90 hover:border-emerald-500 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden text-center"
              >
                {/* Top Accent Gradient Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-500 to-[#051939]" />

                {/* Photo Frame with Dual-Layer Regal Border */}
                <div className="relative p-1.5 rounded-xl bg-gradient-to-b from-amber-200/70 via-slate-100 to-emerald-200/70 border border-amber-300/40 group-hover:border-emerald-400 shadow-sm transition-colors duration-300">
                  <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                    {teacher.photo ? (
                      <Image
                        src={teacher.photo}
                        alt={teacher.nameBengali}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50 group-hover:text-slate-400 transition-colors">
                        <FaUserCircle size={80} className="opacity-50" />
                      </div>
                    )}

                    {/* Subtle Inner Glass Vignette on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#051939]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold text-[#051939] font-bengali group-hover:text-[#06874A] transition-colors leading-tight line-clamp-1">
                      {teacher.nameBengali}
                    </h3>
                    <div className="mt-1.5">
                      <span className="inline-block text-[11px] md:text-xs font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-0.5 rounded-full line-clamp-1 shadow-xs font-bengali">
                        {teacher.designation}
                      </span>
                    </div>
                    {teacher.subject && (
                      <p className="text-[11px] text-gray-500 font-bengali mt-1.5 italic line-clamp-1">
                        {teacher.subject}
                      </p>
                    )}
                  </div>

                  {/* Animated Bottom Indicator */}
                  <div className="w-8 group-hover:w-16 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-3 rounded-full transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
