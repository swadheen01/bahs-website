"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

interface Slider {
  id: number;
  title: string;
  image: string;
  sort_order?: number;
}

const defaultSlides: Slider[] = [
  { id: 1, title: "শ্রেণী কক্ষ পরিদর্শনে উপজেলা মাধ্যমিক শিক্ষা অফিসার", image: "/images/hero/slide-1.jpg" },
  { id: 2, title: "বিদ্যালয়ের বার্ষিক ক্রীড়া ও সাংস্কৃতিক প্রতিযোগিতা", image: "/images/hero/slide-2.jpg" },
  { id: 3, title: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় প্রাঙ্গণ", image: "/images/hero/slide-3.jpg" },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slider[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    fetch('/api/sliders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
          setSlides(sorted);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="w-full bg-gradient-to-b from-[#465b6a]/10 via-gray-100 to-gray-50 py-3 sm:py-5 px-3 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Photo Frame Container with Multi-Layered Photographic Frame Border */}
        <div className="relative p-1.5 sm:p-3 bg-gradient-to-b from-white via-slate-50 to-gray-200 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-300/80 ring-1 ring-black/5">
          {/* Slider Viewport with Natural Horizontal Camera Photo Aspect Ratio (16:9) */}
          <div className="relative w-full aspect-[16/9] md:aspect-[16/8.5] max-h-[460px] rounded-xl sm:rounded-2xl overflow-hidden bg-[#051939] select-none shadow-inner">
            {slides.map((slide, index) => (
              <div
                key={`${slide.id}-${index}`}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 1024px"
                />

                {/* Sleek bottom gradient for caption (Matching clean landscape reference) */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent pt-8 pb-3 sm:pb-4 px-4 sm:px-6 flex flex-col items-center justify-end text-center pointer-events-none">
                  <h2 className="text-white text-xs sm:text-base md:text-xl font-bold drop-shadow-md line-clamp-1 max-w-3xl">
                    {slide.title}
                  </h2>
                </div>
              </div>
            ))}

            {/* Left / Right Arrow Buttons */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 bg-black/45 hover:bg-black/75 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-colors shadow-md cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <FaChevronLeft size={12} className="sm:text-sm" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
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
                    onClick={() => setCurrentSlide(i)}
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
    </section>
  );
}
