"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

interface Slider {
  id: number;
  title: string;
  image: string;
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
    <div className="relative w-full h-[320px] md:h-[480px] lg:h-[620px] overflow-hidden bg-[#051939]">
      {slides.map((slide, index) => (
        <div
          key={`${slide.id}-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 z-10" />
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          
          {/* Title placed at the bottom */}
          <div className="absolute bottom-8 md:bottom-12 left-0 right-0 z-20 flex flex-col items-center px-4">
            <span className="bg-[#06874A] text-white text-xs md:text-sm px-3 py-1 rounded-full font-bold mb-2 shadow">
              {language === "bn" ? "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়" : "Baniyachong Adarsha High School"}
            </span>
            <h2 className="text-white text-lg md:text-2xl lg:text-3xl font-bold text-center bg-black/60 backdrop-blur-sm px-6 py-2.5 rounded-xl shadow-xl max-w-4xl border border-white/10">
              {slide.title}
            </h2>
          </div>
        </div>
      ))}
      
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-xs"
            aria-label="Previous Slide"
          >
            <FaChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-xs"
            aria-label="Next Slide"
          >
            <FaChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? "w-6 bg-[#06874A]" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
