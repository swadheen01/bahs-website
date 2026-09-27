import ClassDetailView from "@/components/students/ClassDetailView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "৮ম শ্রেণি (Class 8) | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
  description: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় ৮ম শ্রেণির একাডেমিক তথ্য, রুটিন ও সিলেবাস।",
};

export default function Class8Page() {
  return <ClassDetailView classNum={8} />;
}
