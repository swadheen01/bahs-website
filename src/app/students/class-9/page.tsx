import ClassDetailView from "@/components/students/ClassDetailView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "৯ম শ্রেণি (Class 9) | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
  description: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় ৯ম শ্রেণির একাডেমিক তথ্য, রুটিন ও সিলেবাস।",
};

export default function Class9Page() {
  return <ClassDetailView classNum={9} />;
}
