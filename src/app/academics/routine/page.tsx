"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toJpeg } from "html-to-image";
import initialRoutines from "@/data/routines.json";
import {
  FaClock,
  FaDownload,
  FaFilePdf,
  FaSpinner,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";
import { safeDownloadFile } from "@/lib/downloadFile";

interface RoutineSlot {
  period?: string;
  time?: string;
  sunday?: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  room?: string;
}

interface RoutineFile {
  id: string;
  title: string;
  titleEn?: string;
  class: string;
  year: string;
  fileUrl: string;
  uploadDate?: string;
}

interface RoutinesData {
  calendarYear?: string;
  routineFiles?: RoutineFile[];
  weeklyRoutines?: Record<string, RoutineSlot[]>;
}

const CLASS_META: Record<string, { bnTitle: string; enTitle: string }> = {
  "6": {
    bnTitle: "৬ষ্ঠ শ্রেণির পূর্ণাঙ্গ সাপ্তাহিক রুটিন",
    enTitle: "Class 6 Complete Weekly Routine",
  },
  "7": {
    bnTitle: "৭ম শ্রেণির পূর্ণাঙ্গ সাপ্তাহিক রুটিন",
    enTitle: "Class 7 Complete Weekly Routine",
  },
  "8": {
    bnTitle: "৮ম শ্রেণির পূর্ণাঙ্গ সাপ্তাহিক রুটিন",
    enTitle: "Class 8 Complete Weekly Routine",
  },
  "9": {
    bnTitle: "৯ম শ্রেণির পূর্ণাঙ্গ সাপ্তাহিক রুটিন",
    enTitle: "Class 9 Complete Weekly Routine",
  },
  "10": {
    bnTitle: "১০ম শ্রেণির পূর্ণাঙ্গ সাপ্তাহিক রুটিন",
    enTitle: "Class 10 Complete Weekly Routine",
  },
};

export default function ClassRoutinePage() {
  const { t, language } = useLanguage();
  const [selectedClass, setSelectedClass] = useState<string>("6");
  const [downloadingJpg, setDownloadingJpg] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string>("");
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [routinesData, setRoutinesData] = useState<RoutinesData>({
    calendarYear: initialRoutines.calendarYear,
    routineFiles: [],
    weeklyRoutines: initialRoutines.weeklyRoutines,
  });

  useEffect(() => {
    fetch("/api/routines", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.weeklyRoutines) {
          setRoutinesData(data);
        }
      })
      .catch(() => {});
  }, []);

  const currentRoutine =
    routinesData?.weeklyRoutines?.[selectedClass] ||
    initialRoutines.weeklyRoutines[selectedClass as keyof typeof initialRoutines.weeklyRoutines] ||
    [];

  const routineFiles = Array.isArray(routinesData?.routineFiles) ? routinesData.routineFiles : [];
  const activeMeta = CLASS_META[selectedClass] || {
    bnTitle: `${selectedClass} শ্রেণির পূর্ণাঙ্গ সাপ্তাহিক রুটিন`,
    enTitle: `Class ${selectedClass} Complete Weekly Routine`,
  };
  const routineTitle = language === "en" ? activeMeta.enTitle : activeMeta.bnTitle;
  const calendarYear = routinesData?.calendarYear || "2026";

  const handleDownloadJpg = async () => {
    const element = exportRef.current;
    if (!element || downloadingJpg) return;

    setDownloadError("");
    setDownloadingJpg(true);

    try {
      const images = Array.from(element.querySelectorAll("img"));
      await Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
        )
      );
      await Promise.all(
        images.map((img) => (typeof img.decode === "function" ? img.decode().catch(() => {}) : Promise.resolve()))
      );

      if (typeof document !== "undefined" && "fonts" in document) {
        await document.fonts.ready.catch(() => {});
      }

      const captureOptions = {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: "#ffffff",
        width: 1080,
        style: {
          margin: "0",
          boxShadow: "none",
        },
      };

      let dataUrl: string;
      try {
        dataUrl = await toJpeg(element, captureOptions);
      } catch {
        dataUrl = await toJpeg(element, { ...captureOptions, skipFonts: true });
      }

      safeDownloadFile(dataUrl, `BAHS_Class_${selectedClass}_Routine_${calendarYear}.jpg`);
    } catch (err) {
      console.error("Failed to generate routine JPG:", err);
      setDownloadError(
        t(
          "রুটিন JPG ডাউনলোড করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।",
          "Failed to generate routine JPG image. Please try again."
        )
      );
    } finally {
      setDownloadingJpg(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-12 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FaClock size={16} />
            <span>{t("একাডেমিক সময়সূচি", "Academic Schedule")}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {t("শ্রেণিভিত্তিক ক্লাস রুটিন ২০২৬", "Class Routine & Timetable 2026")}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-2 flex items-center gap-2">
            <Link href="/" className="hover:text-yellow-300 transition-colors">
              {t("প্রচ্ছদ", "Home")}
            </Link>
            <span>&rsaquo;</span>
            <span>{t("একাডেমিক", "Academics")}</span>
            <span>&rsaquo;</span>
            <span className="text-yellow-300 font-bold">{t("ক্লাস রুটিন", "Class Routine")}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-6xl space-y-8 relative z-10">
        {/* PDF Download Cards (Uploaded by Admin) */}
        {routineFiles.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-[#051939] flex items-center gap-2">
                <FaFilePdf className="text-red-500" />
                {t("অফিসিয়াল ক্লাস রুটিন ডাউনলোড (PDF / ফাইল)", "Official Routine Downloads (PDF / Files)")}
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                {t("হালনাগাদ সংস্করণ", "Updated Version")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {routineFiles.map((file: RoutineFile) => (
                <div
                  key={file.id}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      {file.class === "all" ? t("সকল শ্রেণি", "All Classes") : `${file.class}ম শ্রেণি`} • {file.year}
                    </span>
                    <h3 className="text-sm font-bold text-[#051939] line-clamp-2">
                      {language === "en" ? file.titleEn || file.title : file.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => safeDownloadFile(file.fileUrl, `${file.title}_Routine`)}
                    className="inline-flex items-center justify-center gap-2 bg-[#06874A] hover:bg-green-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow transition cursor-pointer"
                  >
                    <FaDownload size={12} />
                    <span>{t("রুটিন ডাউনলোড করুন", "Download Routine")}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Routine Interactive Table Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden printable-routine">
          {/* Header Controls */}
          <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                {t("সাপ্তাহিক ক্লাসের সময়সূচি", "Weekly Class Routine")}
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                {routineTitle}
              </h2>
              <p className="text-xs text-gray-300 mt-1">
                {t(
                  "রবিবার থেকে বৃহস্পতিবার — সকাল ১০:০০ টা থেকে বিকাল ৪:৩০ টা পর্যন্ত",
                  "Sunday to Thursday — 10:00 AM to 4:30 PM"
                )}
              </p>
            </div>

            <div className="no-print flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadJpg}
                disabled={downloadingJpg || currentRoutine.length === 0}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-white/20 shadow-md transition cursor-pointer disabled:cursor-not-allowed"
              >
                {downloadingJpg ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                <span>
                  {downloadingJpg
                    ? t("JPG তৈরি হচ্ছে...", "Generating JPG...")
                    : t("ক্লাস রুটিন ডাউনলোড", "Download Class Routine")}
                </span>
              </button>
            </div>
          </div>

          {downloadError && (
            <div
              role="alert"
              className="mx-4 sm:mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700"
            >
              {downloadError}
            </div>
          )}

          {/* Class Select Tabs */}
          <div className="no-print p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-center gap-2">
            {[
              { num: "6", labelBn: "৬ষ্ঠ শ্রেণি", labelEn: "Class 6" },
              { num: "7", labelBn: "৭ম শ্রেণি", labelEn: "Class 7" },
              { num: "8", labelBn: "৮ম শ্রেণি", labelEn: "Class 8" },
              { num: "9", labelBn: "৯ম শ্রেণি", labelEn: "Class 9" },
              { num: "10", labelBn: "১০ম শ্রেণি", labelEn: "Class 10" },
            ].map((cls) => (
              <button
                type="button"
                key={cls.num}
                onClick={() => setSelectedClass(cls.num)}
                className={`py-2 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  selectedClass === cls.num
                    ? "bg-[#06874A] text-white shadow-md scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {language === "en" ? cls.labelEn : cls.labelBn}
              </button>
            ))}
          </div>

          {/* Routine Table */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-[#051939] text-white uppercase text-xs">
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("পিরিয়ড", "Period")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("সময়", "Time")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("রবিবার", "Sun")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("সোমবার", "Mon")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("মঙ্গলবার", "Tue")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("বুধবার", "Wed")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("বৃহস্পতিবার", "Thu")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("কক্ষ", "Room")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentRoutine.map((slot: RoutineSlot, idx: number) => {
                  const periodText = String(slot.period || "");
                  const isBreak =
                    periodText.includes("টিফিন") ||
                    periodText.includes("বিরতি") ||
                    periodText.toLowerCase().includes("break");
                  return (
                    <tr
                      key={idx}
                      className={
                        isBreak
                          ? "bg-amber-50/80 font-bold text-amber-900 text-center"
                          : "hover:bg-gray-50 transition"
                      }
                    >
                      <td className="py-3 px-3 border border-gray-200 font-bold text-[#051939] text-center">
                        {slot.period}
                      </td>
                      <td className="py-3 px-3 border border-gray-200 font-mono text-xs text-center text-gray-600">
                        {slot.time}
                      </td>

                      {isBreak ? (
                        <td
                          colSpan={5}
                          className="py-3 px-3 border border-gray-200 text-center font-bold text-amber-800 tracking-wider"
                        >
                          {t("নামাজ ও দুপুরের টিফিন বিরতি", "Prayer & Lunch Break")}
                        </td>
                      ) : (
                        <>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.sunday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.monday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.tuesday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.wednesday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.thursday}
                          </td>
                        </>
                      )}

                      <td className="py-3 px-3 border border-gray-200 font-mono text-center text-gray-500">
                        {slot.room || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Routine Note */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>
              {t(
                "* বিশেষ পরিস্থিতিতে বা পরীক্ষার পূর্বে প্রধান শিক্ষকের নির্দেশক্রমে রুটিন পরিবর্তিত হতে পারে।",
                "* Routine schedule is subject to administrative adjustments during exam periods."
              )}
            </span>
            <span className="font-bold text-[#051939]">
              {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "BAHS Academic Council")}
            </span>
          </div>
        </div>
      </div>

      {/* Off-screen fixed-width export sheet for crisp uncropped JPG capture on any device */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-10000px",
          top: "0",
          width: "1080px",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div
          ref={exportRef}
          className={`bg-white text-gray-900 border border-gray-200 ${language === "bn" ? "font-bengali" : "font-sans"}`}
          style={{ width: "1080px" }}
        >
          {/* Official School & Class Routine Header */}
          <div
            className="text-white px-8 py-6 flex items-center justify-between gap-6"
            style={{
              background: "linear-gradient(90deg, #051939 0%, #092b5e 50%, #051939 100%)",
            }}
          >
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/logo.png"
                alt=""
                width={60}
                height={60}
                loading="eager"
                className="w-[60px] h-[60px] rounded-full bg-white p-1 object-contain shrink-0"
              />
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
                </h2>
                <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                  {t(
                    "উপজেলাঃ বানিয়াচং, জেলাঃ হবিগঞ্জ • EIIN: 129344 | স্থাপিত: ১৯৮৫",
                    "Baniyachong, Habiganj • EIIN: 129344 | ESTD: 1985"
                  )}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                {t(`সাপ্তাহিক ক্লাসের সময়সূচি — ${calendarYear}`, `Weekly Class Routine — ${calendarYear}`)}
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {routineTitle}
              </h3>
              <p className="text-xs text-gray-200 mt-0.5">
                {t(
                  "রবিবার থেকে বৃহস্পতিবার — সকাল ১০:০০ টা থেকে বিকাল ৪:৩০ টা পর্যন্ত",
                  "Sunday to Thursday — 10:00 AM to 4:30 PM"
                )}
              </p>
            </div>
          </div>

          {/* Full Unclipped 8-Column Routine Table */}
          <div className="p-6 bg-white">
            <table className="w-full text-sm text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-[#051939] text-white uppercase text-xs">
                  <th className="py-3 px-3 border border-[#1d3557] text-center">{t("পিরিয়ড", "Period")}</th>
                  <th className="py-3 px-3 border border-[#1d3557] text-center">{t("সময়", "Time")}</th>
                  <th className="py-3 px-3 border border-[#1d3557] text-center">{t("রবিবার", "Sun")}</th>
                  <th className="py-3 px-3 border border-[#1d3557] text-center">{t("সোমবার", "Mon")}</th>
                  <th className="py-3 px-3 border border-[#1d3557] text-center">{t("মঙ্গলবার", "Tue")}</th>
                  <th className="py-3 px-3 border border-[#1d3557] text-center">{t("বুধবার", "Wed")}</th>
                  <th className="py-3 px-3 border border-[#1d3557] text-center">{t("বৃহস্পতিবার", "Thu")}</th>
                  <th className="py-3 px-3 border border-[#1d3557] text-center">{t("কক্ষ", "Room")}</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {currentRoutine.map((slot: RoutineSlot, idx: number) => {
                  const periodText = String(slot.period || "");
                  const isBreak =
                    periodText.includes("টিফিন") ||
                    periodText.includes("বিরতি") ||
                    periodText.toLowerCase().includes("break");
                  return (
                    <tr
                      key={idx}
                      className={isBreak ? "bg-amber-50 font-bold text-amber-900 text-center" : idx % 2 === 1 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="py-3 px-3 border border-gray-200 font-bold text-[#051939] text-center">
                        {slot.period}
                      </td>
                      <td className="py-3 px-3 border border-gray-200 font-mono text-xs text-center text-gray-700">
                        {slot.time}
                      </td>

                      {isBreak ? (
                        <td
                          colSpan={5}
                          className="py-3 px-3 border border-gray-200 text-center font-bold text-amber-800 tracking-wider"
                        >
                          {t("নামাজ ও দুপুরের টিফিন বিরতি", "Prayer & Lunch Break")}
                        </td>
                      ) : (
                        <>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.sunday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.monday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.tuesday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.wednesday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.thursday}
                          </td>
                        </>
                      )}

                      <td className="py-3 px-3 border border-gray-200 font-mono text-center text-gray-600">
                        {slot.room || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Note */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-700 flex justify-between items-center">
            <span>
              {t(
                "* বিশেষ পরিস্থিতিতে বা পরীক্ষার পূর্বে প্রধান শিক্ষকের নির্দেশক্রমে রুটিন পরিবর্তিত হতে পারে।",
                "* Routine schedule is subject to administrative adjustments during exam periods."
              )}
            </span>
            <span className="font-bold text-[#051939]">
              {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "BAHS Academic Council")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
