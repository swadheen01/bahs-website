import type { Metadata } from "next";
import { noticesDB } from "@/lib/db";
import NoticeTable from "@/components/notices/NoticeTable";

export const revalidate = 86400; // 24h ISR, revalidated on-demand when notice is added/edited/deleted

export const metadata: Metadata = {
  title: "নোটিশ বোর্ড | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
};

export default async function NoticesPage() {
  const notices = await noticesDB.getAll();

  return <NoticeTable notices={notices} />;
}

