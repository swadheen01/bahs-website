import ClassDetailView from "@/components/students/ClassDetailView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "৬ষ্ঠ শ্রেণি (Class 6) | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
  description: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় ৬ষ্ঠ শ্রেণির একাডেমিক তথ্য, রুটিন ও সিলেবাস।",
};

export default function Class6Page() {
  return <ClassDetailView classNum={6} />;
}
