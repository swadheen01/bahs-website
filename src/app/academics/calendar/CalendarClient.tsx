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

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

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
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-emerald-100 hover:text-emerald-600 transition">
              <FaChevronLeft />
            </button>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-[#051939]">
                {language === "en" ? monthNamesEn[currentDate.getMonth()] : monthNamesBn[currentDate.getMonth()]} {language === "en" ? currentDate.getFullYear() : toBengaliNumber(currentDate.getFullYear())}
              </h2>
              <p className="text-emerald-600 font-bold text-sm mt-1 flex items-center justify-center gap-1">
                <FaRegCalendarAlt />
                {t("অ্যাকাডেমিক ক্যালেন্ডার", "Academic Calendar")}
              </p>
            </div>
            <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-emerald-100 hover:text-emerald-600 transition">
              <FaChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-3 mb-4">
            {(language === "en" ? weekDaysEn : weekDaysBn).map(day => (
              <div key={day} className="text-center font-bold text-gray-500 text-xs md:text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-3">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 md:h-24 rounded-xl bg-gray-50/50 border border-transparent"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const holiday = isHoliday(date);
              const isFriday = date.getDay() === 5;
              const bengaliDate = getBengaliDate(date);

              let bgClass = "bg-white border-gray-100 hover:border-emerald-300";
              let textClass = "text-gray-800";

              if (holiday) {
                bgClass = "bg-red-50 border-red-200 hover:border-red-400";
                textClass = "text-red-700";
              } else if (isFriday) {
                bgClass = "bg-rose-50/50 border-rose-100";
                textClass = "text-rose-600";
              }

              const isToday = date.toDateString() === new Date().toDateString();
              if (isToday) {
                bgClass += " ring-2 ring-[#06874A]";
              }

              return (
                <div key={day} className={`h-16 md:h-24 rounded-lg md:rounded-xl border ${bgClass} p-1 md:p-2 flex flex-col relative transition-all group`}>
                  <div className={`text-base md:text-xl font-bold ${textClass}`}>
                    {language === "en" ? day : toBengaliNumber(day)}
                  </div>
                  <div className="text-[9px] md:text-[11px] text-gray-500 font-medium">
                    {language === "en" ? `${bengaliDate.day} ${bengaliDate.month}` : `${toBengaliNumber(bengaliDate.day)} ${bengaliDate.month}`}
                  </div>

                  {holiday && (
                    <div className="mt-auto hidden md:block">
                      <p className="text-[10px] leading-tight font-bold text-red-600 bg-red-100/50 px-1 rounded truncate">
                        {language === "en" ? holiday.titleEn : holiday.title}
                      </p>
                    </div>
                  )}

                  {/* Tooltip for mobile or small details */}
                  {holiday && (
                    <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-gray-900 text-white text-xs p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      <span className="font-bold">{language === "en" ? holiday.titleEn : holiday.title}</span>
                      <br/>
                      <span className="text-gray-300 text-[10px]">{language === "en" ? holiday.type : holiday.type}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs md:text-sm font-medium text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-50 border border-red-200"></span>
              {t("সরকারি/অন্যান্য ছুটি", "Govt/Other Holiday")}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-rose-50/50 border border-rose-100"></span>
              {t("সাপ্তাহিক ছুটি", "Weekly Holiday")}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-white border border-gray-100 ring-2 ring-[#06874A]"></span>
              {t("আজকের দিন", "Today")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

