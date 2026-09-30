"use client";
import { useState, useEffect } from "react";
import initialSlides from "@/data/sliders.json";
import { FaChevronLeft, FaChevronRight, FaTimes, FaEye } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

interface Slider {
  id: number;
  title: string;
  image: string;
  sort_order?: number;
}

export default function HeroSlider({ initialSlides: propSlides }: { initialSlides?: Slider[] }) {
  const [slides, setSlides] = useState<Slider[]>(() => {
    if (propSlides && propSlides.length > 0) return propSlides;
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("bahs_hero_sliders");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return (initialSlides as Slider[]) || [];
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    // Clean up any stale localStorage from previous versions
    try {
      localStorage.removeItem("bahs_cached_sliders");
    } catch (e) {}

    // Fetch latest sliders from server to ensure fresh content with cache buster
    fetch("/api/sliders?t=" + new Date().getTime())
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
          
          try {
            sessionStorage.setItem("bahs_hero_sliders", JSON.stringify(sorted));
          } catch (e) {}

          setSlides((prev) => {
            // If the order or items changed, reset current slide to 0 to show the correct first slide instantly
            const prevIds = prev.map(s => s.id).join(',');
            const newIds = sorted.map(s => s.id).join(',');
            if (prevIds !== newIds) {
              setCurrentSlide(0);
            }
            return sorted;
          });
        }
      })
      .catch((e) => console.error("Slider fetch error:", e));
  }, []);

  // Auto slide timer (paused when lightbox modal is open)
  useEffect(() => {
    if (slides.length <= 1 || lightboxIndex !== null) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // slightly increased to 4s to give more time to read, was 3s
    return () => clearInterval(timer);
  }, [slides.length, lightboxIndex]);

  // Handle keyboard events & prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => {
          const nextIdx = prev !== null ? (prev - 1 + slides.length) % slides.length : 0;
          setCurrentSlide(nextIdx);
          return nextIdx;
        });
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => {
          const nextIdx = prev !== null ? (prev + 1) % slides.length : 0;
          setCurrentSlide(nextIdx);
          return nextIdx;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxIndex, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="w-full bg-gradient-to-b from-[#465b6a]/10 via-gray-100 to-gray-50 py-3 sm:py-5 px-3 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Photo Frame Container with Multi-Layered Photographic Frame Border */}
        <div className="relative p-1.5 sm:p-3 bg-gradient-to-b from-white via-slate-50 to-gray-200 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-300/80 ring-1 ring-black/5">
          {/* Slider Viewport with Natural Horizontal Camera Photo Aspect Ratio (16:9) */}
          <div className="relative w-full aspect-[16/9] md:aspect-[16/8.5] max-h-[460px] rounded-xl sm:rounded-2xl overflow-hidden bg-[#051939] select-none shadow-inner group">
            {slides.map((slide, index) => (
              <div
                key={`${slide.id}-${index}`}
                onClick={() => setLightboxIndex(index)}
                role="button"
                tabIndex={0}
                title={language === "en" ? "Click to view full photo" : "ছবিটি বড় করে দেখতে ক্লিক করুন"}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out cursor-pointer ${
                  index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                />

                {/* Hover indicator to signal clickable picture */}
                <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 hover:bg-black/80 text-white text-[11px] sm:text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-xs pointer-events-none">
                  <FaEye size={12} />
                  <span>{language === "en" ? "View Photo" : "ছবি দেখুন"}</span>
                </div>

                {/* Sleek bottom gradient for caption */}
                {slide.title && (
                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent pt-8 pb-3 sm:pb-4 px-4 sm:px-6 flex flex-col items-center justify-end text-center pointer-events-none">
                    <h2 className="text-white text-xs sm:text-base md:text-xl font-bold drop-shadow-md line-clamp-1 max-w-3xl">
                      {slide.title}
                    </h2>
                  </div>
                )}
              </div>
            ))}

            {/* Left / Right Arrow Buttons */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 bg-black/45 hover:bg-black/75 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-colors shadow-md cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <FaChevronLeft size={12} className="sm:text-sm" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % slides.length);
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 bg-black/45 hover:bg-black/75 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-colors shadow-md cursor-pointer"
                  aria-label="Next Slide"
                >
                  <FaChevronRight size={12} className="sm:text-sm" />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {slides.length > 1 && (
              <div className="absolute bottom-1.5 sm:bottom-2.5 left-0 right-0 z-20 flex justify-center gap-1.5 sm:gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(i);
                    }}
                    className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                      i === currentSlide ? "w-5 sm:w-7 bg-[#06874A]" : "w-1.5 sm:w-2 bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Picture View Modal */}
      {lightboxIndex !== null && slides[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 transition-all duration-300 animate-in fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar Controls */}
          <div className="absolute top-3 sm:top-5 inset-x-3 sm:inset-x-6 flex items-center justify-between z-30 pointer-events-none">
            <span className="text-white/80 text-xs sm:text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-xs pointer-events-auto">
              {lightboxIndex + 1} / {slides.length}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(null);
              }}
              className="w-9 h-9 sm:w-11 sm:h-11 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs border border-white/20 shadow-lg pointer-events-auto"
              aria-label="Close"
              title={language === "en" ? "Close (Esc)" : "বন্ধ করুন (Esc)"}
            >
              <FaTimes size={16} className="sm:text-lg" />
            </button>
          </div>

          {/* Previous Button inside Lightbox */}
          {slides.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextIdx = (lightboxIndex - 1 + slides.length) % slides.length;
                setLightboxIndex(nextIdx);
                setCurrentSlide(nextIdx);
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-xs border border-white/20 shadow-lg cursor-pointer"
              aria-label="Previous Photo"
            >
              <FaChevronLeft size={16} className="sm:text-lg" />
            </button>
          )}

          {/* Next Button inside Lightbox */}
          {slides.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextIdx = (lightboxIndex + 1) % slides.length;
                setLightboxIndex(nextIdx);
                setCurrentSlide(nextIdx);
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-xs border border-white/20 shadow-lg cursor-pointer"
              aria-label="Next Photo"
            >
              <FaChevronRight size={16} className="sm:text-lg" />
            </button>
          )}

          {/* Main Photo View */}
          <div
            className="relative max-w-5xl max-h-[78vh] sm:max-h-[82vh] flex flex-col items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={slides[lightboxIndex].image}
              alt={slides[lightboxIndex].title}
              className="max-w-full max-h-[70vh] sm:max-h-[76vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
            />

            {/* Photo Title / Caption */}
            {slides[lightboxIndex].title && (
              <div className="mt-3 text-center px-4 max-w-2xl">
                <p className="text-white text-sm sm:text-base md:text-lg font-medium drop-shadow-md">
                  {slides[lightboxIndex].title}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
