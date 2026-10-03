"use client";
import { useLanguage } from "@/lib/LanguageContext";

export default function PhotoGalleryClient({ photos }: { photos: any[] }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Page Banner */}
      <div className="bg-[#465b6a] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            {t("ফটোগ্যালারী", "Photo Gallery")}
          </h1>
          <div className="w-16 h-1 bg-[#06874A] mx-auto mt-3 mb-2 rounded-full"></div>
          <p className="text-gray-200 text-sm">
            {t(
              "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের বিভিন্ন কার্যক্রমের খণ্ডচিত্র",
              "Glimpses of various activities and moments of Baniyachong Adarsha High School"
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-6xl">
        {photos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm text-gray-400">
            {t("বর্তমানে কোনো ছবি প্রদর্শনের জন্য নেই।", "No photos available to display currently.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <div
                key={`${photo.id}-${index}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base leading-snug group-hover:text-[#06874A] transition-colors mb-2">
                    {photo.caption}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                    <span className="bg-emerald-50 text-[#06874A] px-2 py-0.5 rounded font-medium text-[11px]">
                      {photo.category === "campus"
                        ? t("ক্যাম্পাস", "Campus")
                        : t("ইভেন্ট", "Event")}
                    </span>
                    <span>{photo.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

