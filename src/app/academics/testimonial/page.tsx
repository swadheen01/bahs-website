import type { Metadata } from "next";
import { Suspense } from "react";
import TestimonialClient from "./TestimonialClient";

export const metadata: Metadata = {
  title: "প্রশংসাপত্র ডাউনলোড (Testimonial) | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
  description: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় এর অফিসিয়াল প্রশংসাপত্র (Testimonial) তৈরি ও প্রিন্ট/ডাউনলোড করুন।",
};

// Certificate fonts are only needed on this page, so they are no longer loaded site-wide.
const CERTIFICATE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Cinzel:wght@700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,700&family=Tinos:ital,wght@0,400;0,700;1,400&display=swap";

export default function TestimonialPage() {
  return (
    <>
    <link rel="stylesheet" href={CERTIFICATE_FONTS_URL} precedence="default" />
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-md border border-gray-200">
            <div className="w-5 h-5 border-2 border-[#051939] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-gray-700">প্রশংসাপত্র লোড হচ্ছে...</span>
          </div>
        </div>
      }
    >
      <TestimonialClient />
    </Suspense>
    </>
  );
}

