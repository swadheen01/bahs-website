import type { Metadata } from "next";
import { noticesDB } from "@/lib/db";
import NoticeTable from "@/components/notices/NoticeTable";

// Notices change through the admin API, so do not create ISR writes.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "নোটিশ বোর্ড | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
};

export default async function NoticesPage() {
  const notices = await noticesDB.getAll();

  return <NoticeTable notices={notices} />;
}

