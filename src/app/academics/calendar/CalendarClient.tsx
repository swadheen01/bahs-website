"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegCalendarAlt,
  FaCalendarCheck,
  FaTimes,
} from "react-icons/fa";
import initialHolidays from "@/data/holidays.json";
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
  totalDays?: string;
  description?: string;
}

interface SelectedDayInfo {
  date: Date;
  dateStr: string;
  holidays: Holiday[];
  isWeeklyHoliday: boolean;
}

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_NAMES_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const WEEK_DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_DAYS_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const FULL_WEEK_DAYS_BN = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];
const FULL_WEEK_DAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function toAsciiDigits(str: string): string {
  return str.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
}

function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getHolidaySpanDays(holiday: Holiday): number {
  const start = toAsciiDigits((holiday.startDate || "").trim());
  const end = toAsciiDigits((holiday.endDate || holiday.startDate || "").trim());
  const startMs = Date.parse(`${start}T00:00:00Z`);
  const endMs = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 999;
  return Math.max(1, Math.round((endMs - startMs) / 86400000) + 1);
}

const emptySubscribe = () => () => {};
const getClientTodayStr = () => toIsoDateString(new Date());
const getServerTodayStr = () => "";

export default function CalendarClient() {
  const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [holidays, setHolidays] = useState<Holiday[]>(
    Array.isArray(initialHolidays?.holidays) ? initialHolidays.holidays : []
  );
  const { t, language } = useLanguage();
  const [selectedDay, setSelectedDay] = useState<SelectedDayInfo | null>(null);
  const todayStr = useSyncExternalStore(
    emptySubscribe,
    getClientTodayStr,
    getServerTodayStr
  );

  useEffect(() => {
    fetch("/api/holidays", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.holidays) && data.holidays.length > 0) {
          setHolidays(data.holidays);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDay) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedDay(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedDay]);

  const { year, month } = viewMonth;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const today = todayStr ? new Date(`${todayStr}T00:00:00`) : null;
  const isCurrentMonth =
    Boolean(today) &&
    year === today!.getFullYear() &&
    month === today!.getMonth();

  const nextMonth = () =>
    setViewMonth(({ year: y, month: m }) =>
      m === 11 ? { year: y + 1, month: 0 } : { year: y, month: m + 1 }
    );
  const prevMonth = () =>
    setViewMonth(({ year: y, month: m }) =>
      m === 0 ? { year: y - 1, month: 11 } : { year: y, month: m - 1 }
    );
  const goToTodayMonth = () => {
    const now = new Date();
    setViewMonth({ year: now.getFullYear(), month: now.getMonth() });
  };

  const getHolidaysForDateStr = (dateStr: string): Holiday[] => {
    return holidays
      .filter((h) => {
        const start = toAsciiDigits((h.startDate || "").trim());
        const end = toAsciiDigits((h.endDate || h.startDate || "").trim());
        return Boolean(start) && dateStr >= start && dateStr <= end;
      })
      .sort((a, b) => getHolidaySpanDays(a) - getHolidaySpanDays(b));
  };

  const monthStartStr = toIsoDateString(new Date(year, month, 1));
  const monthEndStr = toIsoDateString(new Date(year, month, daysInMonth));
  const monthHolidays = holidays
    .filter((h) => {
      const start = toAsciiDigits((h.startDate || "").trim());
      const end = toAsciiDigits((h.endDate || h.startDate || "").trim());
      return Boolean(start) && start <= monthEndStr && end >= monthStartStr;
    })
    .sort((a, b) =>
      toAsciiDigits(a.startDate || "").localeCompare(toAsciiDigits(b.startDate || ""))
    );

  return (
    <div
      className={`py-10 md:py-12 bg-slate-50 min-h-screen ${
        language === "bn" ? "font-bengali" : "font-sans"
      }`}
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-100/80 text-emerald-800 border border-emerald-200 shadow-sm mb-4">
            <FaRegCalendarAlt size={14} className="text-emerald-600" />
            <span>{t("একাডেমিক ক্যালেন্ডার ও ছুটির পঞ্জিকা", "Academic Calendar & Holidays")}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-[#051939] to-slate-800 tracking-tight mb-4">
            {language === "en" ? MONTH_NAMES_EN[month] : MONTH_NAMES_BN[month]}{" "}
            {language === "en" ? year : toBengaliNumber(year)}
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#06874A] via-emerald-400 to-[#051939] mx-auto rounded-full shadow-sm" />
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-4 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-60 translate-x-1/3 translate-y-1/3 pointer-events-none" />

          {/* Month Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8 relative z-10">
            <button
              type="button"
              onClick={prevMonth}
              aria-label={t("আগের মাস", "Previous month")}
              className="group flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-[#051939] hover:border-[#051939] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <FaChevronLeft className="text-slate-600 group-hover:text-white transition-colors" />
            </button>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                {t("সাপ্তাহিক ছুটি: প্রতি শুক্র ও শনিবার", "Weekly Holidays: Fri & Sat")}
              </span>
              {!isCurrentMonth && (
                <button
                  type="button"
                  onClick={goToTodayMonth}
                  className="text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
                >
                  {t("চলতি মাসে যান", "Go to Current Month")}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              aria-label={t("পরের মাস", "Next month")}
              className="group flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-[#051939] hover:border-[#051939] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <FaChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Weekday Headers (Friday idx=5 & Saturday idx=6 highlighted as Weekly Holidays) */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-4 mb-4 relative z-10">
            {(language === "en" ? WEEK_DAYS_EN : WEEK_DAYS_BN).map((day, idx) => {
              const isWeekendCol = idx === 5 || idx === 6;
              return (
                <div
                  key={day}
                  className={`text-center font-extrabold text-xs md:text-sm py-2 md:py-3 rounded-xl ${
                    isWeekendCol
                      ? "text-rose-700 bg-amber-100/75 border border-amber-200 shadow-xs"
                      : "text-slate-600 bg-slate-100/80 border border-slate-200/70"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-4 relative z-10">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[5.25rem] md:h-28 rounded-2xl bg-slate-50/40 border border-dashed border-slate-200"
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const dateStr = toIsoDateString(date);
              const dayHolidays = getHolidaysForDateStr(dateStr);
              const primaryHoliday = dayHolidays[0] || null;
              const dayOfWeek = date.getDay();
              const isWeeklyHoliday = dayOfWeek === 5 || dayOfWeek === 6;
              const bengaliDate = getBengaliDate(date);
              const isToday = dateStr === todayStr;
              const isInteractive = Boolean(primaryHoliday) || isWeeklyHoliday;

              let bgClass = "bg-white border-slate-200";
              let textClass = "text-slate-800";
              let dateAccent = "text-slate-400";
              let hoverClass =
                "hover:border-[#051939] hover:shadow-lg hover:-translate-y-1 bg-white";

              if (primaryHoliday) {
                bgClass =
                  "bg-gradient-to-br from-red-50 to-rose-100/80 border-rose-300";
                textClass = "text-rose-700";
                dateAccent = "text-rose-500";
                hoverClass =
                  "hover:border-rose-600 hover:shadow-rose-200/80 hover:shadow-xl hover:-translate-y-1";
              } else if (isWeeklyHoliday) {
                bgClass =
                  "bg-gradient-to-br from-amber-50/90 to-orange-50/80 border-amber-200";
                textClass = "text-rose-600";
                dateAccent = "text-amber-700";
                hoverClass =
                  "hover:border-amber-500 hover:shadow-amber-100 hover:shadow-lg hover:-translate-y-1";
              }

              if (isToday) {
                bgClass = primaryHoliday
                  ? "bg-gradient-to-br from-emerald-50 via-rose-50 to-red-50 border-[#06874A] ring-4 ring-emerald-500/20 shadow-lg"
                  : isWeeklyHoliday
                  ? "bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-50 border-[#06874A] ring-4 ring-emerald-500/20 shadow-lg"
                  : "bg-gradient-to-br from-emerald-50 to-[#06874A]/15 border-[#06874A] ring-4 ring-emerald-500/20 shadow-lg";
                textClass = primaryHoliday
                  ? "text-rose-700"
                  : "text-emerald-800";
                dateAccent = "text-emerald-700";
                hoverClass =
                  "hover:border-emerald-700 hover:shadow-emerald-200 hover:shadow-xl hover:-translate-y-1";
              }

              const dayTitleText = primaryHoliday
                ? language === "en"
                  ? primaryHoliday.titleEn
                  : primaryHoliday.title
                : isWeeklyHoliday
                ? t("সাপ্তাহিক ছুটি", "Weekly Holiday")
                : "";

              const ariaLabel = `${day} ${
                language === "en" ? MONTH_NAMES_EN[month] : MONTH_NAMES_BN[month]
              } ${year}${dayTitleText ? ` — ${dayTitleText}` : ""}`;

              const cellContent = (
                <>
                  {isToday && (
                    <span className="absolute top-1 right-1 md:top-1.5 md:right-1.5 px-1.5 py-0.5 rounded-md bg-[#06874A] text-white text-[8px] md:text-[10px] font-bold leading-none shadow-xs">
                      {t("আজ", "Today")}
                    </span>
                  )}

                  {!isToday && primaryHoliday && isWeeklyHoliday && (
                    <span className="absolute top-1 right-1 md:top-1.5 md:right-1.5 px-1 py-0.5 rounded bg-amber-200/80 text-amber-900 text-[7px] md:text-[9px] font-bold leading-none">
                      {language === "en" ? WEEK_DAYS_EN[dayOfWeek] : WEEK_DAYS_BN[dayOfWeek]}
                    </span>
                  )}

                  {primaryHoliday && dayHolidays.length > 1 && (
                    <span className="absolute top-1 left-1 md:top-1.5 md:left-1.5 px-1 py-0.5 rounded bg-rose-600 text-white text-[7px] md:text-[9px] font-bold leading-none">
                      +{language === "en" ? dayHolidays.length - 1 : toBengaliNumber(dayHolidays.length - 1)}
                    </span>
                  )}

                  <span
                    className={`text-lg sm:text-xl md:text-3xl font-black ${textClass} leading-none mb-1 group-hover:scale-110 transition-transform`}
                  >
                    {language === "en" ? day : toBengaliNumber(day)}
                  </span>
                  <span
                    className={`text-[9px] md:text-xs font-bold ${dateAccent} leading-none mb-3 md:mb-4`}
                  >
                    {language === "en"
                      ? `${bengaliDate.day} ${bengaliDate.month}`
                      : `${toBengaliNumber(bengaliDate.day)} ${bengaliDate.month}`}
                  </span>

                  {primaryHoliday ? (
                    <div className="absolute bottom-1 md:bottom-1.5 inset-x-1 md:inset-x-1.5">
                      <div className="text-[8px] md:text-[10px] leading-tight font-bold text-rose-800 bg-rose-100/95 px-1 py-0.5 rounded truncate text-center border border-rose-200 shadow-xs group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-700 transition-colors">
                        {language === "en" ? primaryHoliday.titleEn : primaryHoliday.title}
                      </div>
                    </div>
                  ) : isWeeklyHoliday ? (
                    <div className="absolute bottom-1 md:bottom-1.5 inset-x-1 md:inset-x-1.5">
                      <div className="text-[8px] md:text-[10px] leading-tight font-bold text-amber-900 bg-amber-100/90 px-1 py-0.5 rounded truncate text-center border border-amber-200">
                        <span className="hidden sm:inline">{t("সাপ্তাহিক ছুটি", "Weekly Off")}</span>
                        <span className="sm:hidden">{t("সাপ্তাহিক", "Off")}</span>
                      </div>
                    </div>
                  ) : null}
                </>
              );

              if (isInteractive) {
                return (
                  <button
                    key={day}
                    type="button"
                    aria-label={ariaLabel}
                    onClick={() =>
                      setSelectedDay({
                        date,
                        dateStr,
                        holidays: dayHolidays,
                        isWeeklyHoliday,
                      })
                    }
                    className={`min-h-[5.25rem] md:h-28 rounded-2xl border-2 ${bgClass} ${hoverClass} p-1 md:p-2 flex flex-col items-center justify-center relative transition-all duration-300 group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#051939]`}
                  >
                    {cellContent}
                  </button>
                );
              }

              return (
                <div
                  key={day}
                  className={`min-h-[5.25rem] md:h-28 rounded-2xl border-2 ${bgClass} ${hoverClass} p-1 md:p-2 flex flex-col items-center justify-center relative transition-all duration-300 group cursor-default`}
                >
                  {cellContent}
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm font-bold text-slate-600 bg-slate-50 py-4 px-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-red-50 to-rose-100 border-2 border-rose-300 shadow-xs" />
              {t("সরকারি / শিক্ষাপঞ্জি ছুটি", "Govt / Academic Holiday")}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-300 shadow-xs" />
              {t("সাপ্তাহিক ছুটি (শুক্র ও শনি)", "Weekly Holiday (Fri & Sat)")}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-50 to-[#06874A]/15 border-2 border-[#06874A] ring-2 ring-emerald-500/20 shadow-xs" />
              {t("আজকের দিন", "Today")}
            </div>
          </div>

          {/* This Month's Official Holidays Summary */}
          <div className="mt-6 pt-6 border-t border-slate-100 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-base md:text-lg font-extrabold text-[#051939] flex items-center gap-2">
                <FaCalendarCheck className="text-rose-600" />
                <span>
                  {t(
                    `${MONTH_NAMES_BN[month]} ${toBengaliNumber(year)} এর নির্ধারিত ছুটিসমূহ`,
                    `Scheduled Holidays in ${MONTH_NAMES_EN[month]} ${year}`
                  )}
                </span>
              </h2>
              <Link
                href="/academics/holidays"
                className="text-xs font-bold text-[#06874A] hover:underline"
              >
                {t("বার্ষিক পূর্ণাঙ্গ ছুটির তালিকা দেখুন →", "View Full Annual Holiday List →")}
              </Link>
            </div>

            {monthHolidays.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                {t(
                  "এই মাসে কোনো অতিরিক্ত সরকারি/উৎসব ছুটি নেই। প্রতি শুক্রবার ও শনিবার নিয়মিত সাপ্তাহিক ছুটি থাকবে।",
                  "No extra government or festival holidays in this month. Regular weekly holidays apply every Friday & Saturday."
                )}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {monthHolidays.map((h) => {
                  const startAscii = toAsciiDigits((h.startDate || "").trim());
                  const dateObj = new Date(`${startAscii}T00:00:00`);
                  const safeDate = Number.isNaN(dateObj.getTime()) ? new Date(year, month, 1) : dateObj;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() =>
                        setSelectedDay({
                          date: safeDate,
                          dateStr: startAscii,
                          holidays: [h],
                          isWeeklyHoliday: safeDate.getDay() === 5 || safeDate.getDay() === 6,
                        })
                      }
                      className="text-left p-3.5 rounded-2xl bg-rose-50/60 hover:bg-rose-50 border border-rose-200/80 transition flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-extrabold text-[#051939] truncate">
                          {language === "en" ? h.titleEn : h.title}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                          {language === "en" ? toAsciiDigits(h.startDate) : toBengaliNumber(h.startDate)}
                          {h.endDate && h.endDate !== h.startDate
                            ? ` — ${language === "en" ? toAsciiDigits(h.endDate) : toBengaliNumber(h.endDate)}`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-rose-700 border border-rose-200">
                        {h.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Holiday / Weekend Detail Modal */}
      {selectedDay && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              aria-label={t("বন্ধ করুন", "Close")}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <FaTimes size={14} />
            </button>

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-amber-50 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
              <FaRegCalendarAlt size={26} className="text-rose-600" />
            </div>

            <div className="text-center mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === "en"
                  ? `${FULL_WEEK_DAYS_EN[selectedDay.date.getDay()]}, ${selectedDay.dateStr}`
                  : `${FULL_WEEK_DAYS_BN[selectedDay.date.getDay()]}, ${toBengaliNumber(selectedDay.dateStr)}`}
              </p>
              {selectedDay.holidays.length === 0 && selectedDay.isWeeklyHoliday && (
                <h3 className="text-2xl font-black text-slate-800 mt-1">
                  {t("সাপ্তাহিক ছুটি", "Weekly Holiday")}
                </h3>
              )}
            </div>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
              {selectedDay.holidays.map((h) => (
                <div
                  key={h.id}
                  className="rounded-2xl bg-rose-50/70 border border-rose-200 p-4 text-left space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {language === "en" ? h.titleEn : h.title}
                    </h3>
                    <span className="shrink-0 text-[10px] font-bold text-rose-700 bg-white rounded-full py-1 px-2.5 border border-rose-200">
                      {h.type}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-600">
                    {language === "en" ? "Date: " : "তারিখ: "}
                    {language === "en" ? toAsciiDigits(h.startDate) : toBengaliNumber(h.startDate)}
                    {h.endDate && h.endDate !== h.startDate
                      ? ` ${language === "en" ? "to" : "থেকে"} ${
                          language === "en" ? toAsciiDigits(h.endDate) : toBengaliNumber(h.endDate)
                        }`
                      : ""}
                    {h.totalDays ? ` (${h.totalDays})` : ""}
                  </p>
                  {h.description && (
                    <p className="text-xs text-slate-700 leading-relaxed">{h.description}</p>
                  )}
                </div>
              ))}

              {selectedDay.isWeeklyHoliday && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-center">
                  <span className="text-xs font-bold text-amber-900">
                    {t(
                      `${FULL_WEEK_DAYS_BN[selectedDay.date.getDay()]} — বিদ্যালয়ের নিয়মিত সাপ্তাহিক ছুটি`,
                      `${FULL_WEEK_DAYS_EN[selectedDay.date.getDay()]} — Regular Weekly School Holiday`
                    )}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-[#051939] text-white font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {t("বন্ধ করুন", "Close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
