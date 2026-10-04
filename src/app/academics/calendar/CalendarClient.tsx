"use client";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaRegCalendarAlt } from "react-icons/fa";
import { getBengaliDate } from "@/lib/bengaliCalendar";
import { useLanguage } from "@/lib/LanguageContext";
import { toBengaliNumber } from "@/lib/utils";

interface Holiday {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  titleEn: string;
  type: string;
}

export default function CalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const { t, language } = useLanguage();

  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  useEffect(() => {
    fetch("/api/holidays")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.holidays)) {
          setHolidays(data.holidays);
        }
      })
      .catch(() => {});
  }, []);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const isHoliday = (date: Date) => {
    const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
    return holidays.find(h => {
      const s = new Date(h.startDate).getTime();
      const e = new Date(h.endDate).getTime();
      const d = date.getTime();
      return d >= s && d <= e;
    });
  };

  const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthNamesBn = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  const weekDaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekDaysBn = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-100/80 text-emerald-800 border border-emerald-200 shadow-sm mb-4">
            <FaRegCalendarAlt size={14} className="text-emerald-600" />
            <span>{t("একাডেমিক ক্যালেন্ডার", "Academic Calendar")}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-[#051939] to-slate-800 tracking-tight mb-4">
            {language === "en" ? monthNamesEn[currentDate.getMonth()] : monthNamesBn[currentDate.getMonth()]} {language === "en" ? currentDate.getFullYear() : toBengaliNumber(currentDate.getFullYear())}
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#06874A] via-emerald-400 to-[#051939] mx-auto rounded-full shadow-sm" />
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-4 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-60 translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <button onClick={prevMonth} className="group flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-[#051939] hover:border-[#051939] transition-all duration-300 shadow-sm hover:shadow-md">
              <FaChevronLeft className="text-slate-600 group-hover:text-white transition-colors" />
            </button>
            <button onClick={nextMonth} className="group flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-[#051939] hover:border-[#051939] transition-all duration-300 shadow-sm hover:shadow-md">
              <FaChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-4 mb-4 relative z-10">
            {(language === "en" ? weekDaysEn : weekDaysBn).map((day, idx) => (
              <div key={day} className={`text-center font-bold text-xs md:text-sm py-2 md:py-3 rounded-xl ${idx === 5 ? 'text-rose-500 bg-rose-50/50' : 'text-slate-500 bg-slate-50/50'}`}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-4 relative z-10">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 md:h-28 rounded-2xl bg-slate-50/30 border border-dashed border-slate-200"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const holiday = isHoliday(date);
              const isFriday = date.getDay() === 5;
              const bengaliDate = getBengaliDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              let bgClass = "bg-white border-slate-200";
              let textClass = "text-slate-700";
              let dateAccent = "text-slate-400";
              let hoverClass = "hover:border-[#051939] hover:shadow-xl hover:-translate-y-1.5 backdrop-blur-sm hover:bg-slate-50/90";

              if (holiday) {
                bgClass = "bg-gradient-to-br from-red-50 to-rose-50 border-rose-200";
                textClass = "text-rose-700";
                dateAccent = "text-rose-400";
                hoverClass = "hover:border-rose-600 hover:shadow-rose-200 hover:shadow-xl hover:-translate-y-1.5";
              } else if (isFriday) {
                bgClass = "bg-slate-50/80 border-slate-200";
                textClass = "text-rose-600";
                dateAccent = "text-rose-400";
                hoverClass = "hover:border-rose-400 hover:shadow-xl hover:-translate-y-1.5";
              }

              if (isToday) {
                bgClass = "bg-gradient-to-br from-emerald-50 to-[#06874A]/10 border-[#06874A] ring-4 ring-emerald-500/20 shadow-lg";
                textClass = "text-emerald-800";
                dateAccent = "text-emerald-600";
                hoverClass = "hover:border-emerald-700 hover:shadow-emerald-200 hover:shadow-xl hover:-translate-y-1.5";
              }

              return (
                <div 
                  key={day} 
                  onClick={() => holiday && setSelectedHoliday(holiday)}
                  className={`h-20 md:h-28 rounded-2xl border-2 ${bgClass} ${hoverClass} p-1 md:p-2 flex flex-col items-center justify-center relative transition-all duration-300 group ${holiday ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />
                  
                  <span className={`text-xl md:text-3xl font-black ${textClass} leading-none mb-1 group-hover:scale-110 transition-transform`}>
                    {language === "en" ? day : toBengaliNumber(day)}
                  </span>
                  <span className={`text-[9px] md:text-xs font-bold ${dateAccent} leading-none group-hover:text-current transition-colors`}>
                    {language === "en" ? `${bengaliDate.day} ${bengaliDate.month}` : `${toBengaliNumber(bengaliDate.day)} ${bengaliDate.month}`}
                  </span>

                  {holiday && (
                    <div className="absolute bottom-1 md:bottom-2 w-[90%] mx-auto">
                      <div className="text-[8px] md:text-[10px] leading-tight font-bold text-rose-700 bg-rose-100/90 px-1 py-0.5 md:py-1 rounded truncate text-center border border-rose-200 shadow-sm group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-700 transition-colors">
                        {language === "en" ? holiday.titleEn : holiday.title}
                      </div>
                    </div>
                  )}
                  
                  {/* Glass Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm font-bold text-slate-600 bg-slate-50 py-4 px-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 border-2 border-rose-200 shadow-sm"></span>
              {t("সরকারি/অন্যান্য ছুটি", "Govt/Other Holiday")}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-slate-50/80 border-2 border-slate-200 shadow-sm"></span>
              {t("সাপ্তাহিক ছুটি", "Weekly Holiday")}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-50 to-[#06874A]/10 border-2 border-[#06874A] ring-2 ring-emerald-500/20 shadow-sm"></span>
              {t("আজকের দিন", "Today")}
            </div>
          </div>
        </div>
      </div>

      {/* Holiday Modal */}
      {selectedHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedHoliday(null)}>
          <div className="bg-white rounded-[2rem] p-6 md:p-10 max-w-sm w-full shadow-2xl transform transition-transform" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-red-50 flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg shadow-rose-100">
              <FaRegCalendarAlt size={32} className="text-rose-600" />
            </div>
            <h3 className="text-2xl font-black text-center text-slate-800 mb-2 leading-tight">
              {language === "en" ? selectedHoliday.titleEn : selectedHoliday.title}
            </h3>
            <div className="flex justify-center mb-6">
              <span className="text-xs font-bold text-rose-600 bg-rose-50 rounded-full py-1.5 px-4 border border-rose-100 shadow-sm">
                {language === "en" ? selectedHoliday.type : selectedHoliday.type}
              </span>
            </div>
            <div className="text-center text-slate-600 text-sm mb-8 font-medium bg-slate-50 rounded-xl py-3 border border-slate-100">
              {language === "en" ? "Date: " + selectedHoliday.startDate : "তারিখ: " + toBengaliNumber(selectedHoliday.startDate)}
            </div>
            <button 
              onClick={() => setSelectedHoliday(null)} 
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-[#051939] text-white font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              {t("বন্ধ করুন", "Close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

