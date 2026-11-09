"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight, FaExpand, FaImage } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function PhotoGalleryClient({ photos: initialPhotos }: { photos: any[] }) {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<any[]>(initialPhotos || []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((item: any) => ({
            id: item.id,
            src: item.src || item.image || "",
            caption: item.caption || item.title || "গ্যালারি ছবি",
            category: item.category || "campus",
            date: item.date || "২০২৬",
          }));
          setPhotos(normalized);
          setImageErrors({});
        }
      })
      .catch(() => {});
  }, []);

  const selectedPhoto = selectedIndex !== null && photos[selectedIndex] ? photos[selectedIndex] : null;

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : photos.length - 1));
  }, [selectedIndex, photos.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < photos.length - 1 ? prev! + 1 : 0));
  }, [selectedIndex, photos.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, handleClose, handlePrev, handleNext]);

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
                key={`${photo.id || index}-${index}`}
                onClick={() => setSelectedIndex(index)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col cursor-pointer hover:-translate-y-1"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedIndex(index);
                  }
                }}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  {!imageErrors[photo.id || index] ? (
                    <Image
                      src={photo.src}
                      alt={photo.caption}
                      fill
                      quality={85}
                      onError={() => setImageErrors(prev => ({ ...prev, [photo.id || index]: true }))}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-300">
                      <FaImage size={40} />
                    </div>
                  )}
                  {/* Corner View Icon on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0">
                    <span className="p-2 bg-black/60 backdrop-blur-md text-white rounded-lg shadow-md flex items-center justify-center">
                      <FaExpand size={13} />
                    </span>
                  </div>
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

      {/* Lightbox Modal for Enlarged Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
          onClick={handleClose}
        >
          {/* Top Bar with Counter and Close Button */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white/90 pb-3 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs sm:text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              {selectedIndex! + 1} / {photos.length}
            </span>
            <button
              onClick={handleClose}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Main Photo View Area with Left/Right Navigation */}
          <div
            className="relative w-full max-w-5xl flex items-center justify-center flex-1 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            {photos.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
                aria-label="Previous Photo"
              >
                <FaChevronLeft size={20} />
              </button>
            )}

            {/* Enlarged Image */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center">
              {!imageErrors[`lb-${selectedPhoto.id || selectedIndex}`] ? (
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.caption}
                  onError={() =>
                    setImageErrors((prev) => ({
                      ...prev,
                      [`lb-${selectedPhoto.id || selectedIndex}`]: true,
                    }))
                  }
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl transition-all duration-300"
                />
              ) : (
                <div className="w-full max-w-xl h-72 flex flex-col items-center justify-center bg-gray-900/80 text-gray-300 rounded-lg border border-white/10">
                  <FaImage size={48} className="mb-2 opacity-50" />
                  <p className="text-xs text-gray-400">
                    {t("ছবিটি লোড করা যায়নি", "Unable to load photo")}
                  </p>
                </div>
              )}
            </div>

            {/* Next Button */}
            {photos.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
                aria-label="Next Photo"
              >
                <FaChevronRight size={20} />
              </button>
            )}
          </div>

          {/* Bottom Caption Bar */}
          <div
            className="w-full max-w-5xl text-center pt-3 px-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-base sm:text-lg font-bold text-white drop-shadow">
              {selectedPhoto.caption}
            </h4>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-300 mt-1">
              <span className="bg-emerald-600/80 text-white px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                {selectedPhoto.category === "campus"
                  ? t("ক্যাম্পাস", "Campus")
                  : t("ইভেন্ট", "Event")}
              </span>
              {selectedPhoto.date && <span>{selectedPhoto.date}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
