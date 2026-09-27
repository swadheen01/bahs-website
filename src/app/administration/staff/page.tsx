"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { FaUserTie, FaPhoneAlt, FaSearch } from "react-icons/fa";

interface Staff {
  id: number;
  nameBengali: string;
  nameEnglish: string;
  designation: string;
  designationEn: string;
  phone?: string;
  photo?: string;
  order: number;
}

export default function StaffPage() {
  const { t, language } = useLanguage();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/staff")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStaffList(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredStaff = staffList.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.nameBengali?.toLowerCase().includes(q) ||
      s.nameEnglish?.toLowerCase().includes(q) ||
      s.designation?.toLowerCase().includes(q) ||
      s.designationEn?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-14 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-emerald-300 border border-white/15 mb-3">
            <FaUserTie size={13} />
            {t("কর্মচারী বৃন্দ", "Staff Members")}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">
            {t("কর্মচারী বৃন্দ", "Staff Members")}
          </h1>
          <div className="w-20 h-1 bg-[#06874A] mx-auto mt-4 mb-3 rounded-full" />
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            {t(
              "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের কর্মচারী বৃন্দের পরিচিতি",
              "Meet the dedicated staff members of Baniyachong Adarsha High School"
            )}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Search Bar & Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder={t("নাম বা পদবি দিয়ে খুঁজুন...", "Search by name or designation...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#06874A] bg-gray-50/50"
            />
            <FaSearch className="absolute left-3.5 top-3 text-gray-400 text-xs" />
          </div>

          <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            {t("মোট কর্মচারী:", "Total Staff:")} {filteredStaff.length} {t("জন", "members")}
          </div>
        </div>

        {/* Staff Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-base">
            {t("লোড হচ্ছে...", "Loading staff members...")}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FaUserTie className="mx-auto text-gray-300 text-4xl mb-3" />
            <p className="text-gray-500 font-bold">{t("কোনো স্টাফ সদস্য পাওয়া যায়নি", "No staff members found")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between glossy-shine hover:-translate-y-1 group"
              >
                <div>
                  {/* Photo area */}
                  <div className="h-48 w-full bg-gradient-to-b from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center">
                    {staff.photo ? (
                      <img
                        src={staff.photo}
                        alt={staff.nameBengali}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-white/70 shadow-inner flex items-center justify-center text-gray-400 border border-white">
                        <FaUserTie size={36} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-[#051939]/80 backdrop-blur-md text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      #{staff.order || staff.id}
                    </div>
                  </div>

                  {/* Info area */}
                  <div className="p-5 text-center">
                    <h3 className="font-bold text-[#051939] text-base group-hover:text-[#06874A] transition-colors leading-snug">
                      {language === "en" ? (staff.nameEnglish || staff.nameBengali) : staff.nameBengali}
                    </h3>

                    {language === "bn" && staff.nameEnglish && (
                      <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                        {staff.nameEnglish}
                      </p>
                    )}

                    <div className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#06874A] border border-emerald-200/60">
                      {language === "en" ? (staff.designationEn || staff.designation) : staff.designation}
                    </div>
                  </div>
                </div>

                {/* Footer / Contact */}
                {staff.phone && (
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-center text-xs text-gray-600 gap-1.5 font-sans">
                    <FaPhoneAlt size={10} className="text-[#06874A]" />
                    <a href={`tel:${staff.phone}`} className="hover:underline">
                      {staff.phone}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
