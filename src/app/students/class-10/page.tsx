import ClassDetailView from "@/components/students/ClassDetailView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "১০ম শ্রেণি (Class 10) | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
  description: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় ১০ম শ্রেণির একাডেমিক তথ্য, রুটিন ও সিলেবাস।",
};

export default function Class10Page() {
  return <ClassDetailView classNum={10} />;
}
