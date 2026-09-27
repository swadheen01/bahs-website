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
                className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="w-full aspect-[4/5] relative bg-[#f1f5f9] border-b border-gray-100">
                  {teacher.photo ? (
                    <Image
                      src={teacher.photo}
                      alt={teacher.nameBengali}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:text-gray-400 transition-colors">
                      <FaUserCircle size={80} className="opacity-50" />
                    </div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-sm font-bold text-[#334155] font-bengali group-hover:text-[#06874A] transition-colors leading-tight">
                    {teacher.nameBengali}
                  </h3>
                  <p className="text-xs text-gray-500 font-bengali mt-1.5 font-medium">
                    {teacher.designation}
                  </p>
                  {teacher.subject && (
                    <p className="text-[10px] text-gray-400 font-bengali mt-1 italic">
                      {teacher.subject}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
