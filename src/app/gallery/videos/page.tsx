"use client";
import Link from "next/link";
import { FaVideo, FaPlay, FaYoutube } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function VideoGalleryPage() {
  const { t, language } = useLanguage();

  const videos = [
    {
      id: "v-1",
      title: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় পরিচিতি ও ক্যাম্পাস প্রামাণ্যচিত্র",
      titleEn: "BAHS Campus & Documentary Tour",
      youtubeId: "dQw4w9WgXcQ", // embed placeholder
      date: "২০২৫",
      category: "ক্যাম্পাস পরিচিতি"
    },
    {
      id: "v-2",
      title: "বার্ষিক ক্রীড়া প্রতিযোগিতা ও পুরস্কার বিতরণী অনুষ্ঠান",
      titleEn: "Annual Sports Competition & Prize Giving Ceremony",
      youtubeId: "dQw4w9WgXcQ",
      date: "২০২৫",
      category: "ক্রীড়া ও সংস্কৃতি"
    },
    {
      id: "v-3",
      title: "মহান শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস পালন",
      titleEn: "International Mother Language Day Celebration",
      youtubeId: "dQw4w9WgXcQ",
      date: "২০২৫",
      category: "জাতীয় দিবস"
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-12 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FaVideo size={16} />
            <span>{t("ভিডিও সংগ্রহশালা", "Video Gallery")}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {t("ভিডিও গ্যালারী", "Video Gallery")}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-2 flex items-center gap-2">
            <Link href="/" className="hover:text-yellow-300 transition-colors">
              {t("প্রচ্ছদ", "Home")}
            </Link>
            <span>&rsaquo;</span>
            <Link href="/gallery/photos" className="hover:text-yellow-300 transition-colors">
              {t("গ্যালারী", "Gallery")}
            </Link>
            <span>&rsaquo;</span>
            <span className="text-yellow-300 font-bold">{t("ভিডিও", "Videos")}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-6xl space-y-8 relative z-10">
        {/* Toggle between Photos & Videos */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200 flex gap-2 max-w-md mx-auto">
          <Link
            href="/gallery/photos"
            className="flex-1 py-2.5 text-center text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            {t("ফটোগ্যালারী (Photos)", "Photos")}
          </Link>
          <div className="flex-1 py-2.5 text-center text-xs sm:text-sm font-bold bg-[#06874A] text-white rounded-xl shadow">
            {t("ভিডিও গ্যালারী (Videos)", "Videos")}
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-xl transition"
            >
              <div className="relative aspect-video bg-black/90 flex items-center justify-center">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                  title={vid.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-4 space-y-2">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                  {vid.category}
                </span>
                <h3 className="text-sm font-bold text-[#051939] line-clamp-2">
                  {language === "en" ? vid.titleEn : vid.title}
                </h3>
                <span className="text-xs text-gray-400 block font-mono">{vid.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
