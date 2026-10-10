import type { Metadata } from "next";
import { Suspense } from "react";
import TestimonialClient from "./TestimonialClient";

export const metadata: Metadata = {
  title: "প্রশংসাপত্র ডাউনলোড (Testimonial) | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
  description: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় এর অফিসিয়াল প্রশংসাপত্র (Testimonial) তৈরি ও প্রিন্ট/ডাউনলোড করুন।",
};

export default function TestimonialPage() {
  return (
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
  );
}

