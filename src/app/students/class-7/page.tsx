import ClassDetailView from "@/components/students/ClassDetailView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "৭ম শ্রেণি (Class 7) | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
  description: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় ৭ম শ্রেণির একাডেমিক তথ্য, রুটিন ও সিলেবাস।",
};

export default function Class7Page() {
  return <ClassDetailView classNum={7} />;
}
