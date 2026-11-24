import type { Metadata } from "next";
import { getNotices } from "@/lib/publicData";
import NoticeTable from "@/components/notices/NoticeTable";

// Prerendered at build; the table refreshes from /api/notices in the browser.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "নোটিশ বোর্ড | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
};

export default async function NoticesPage() {
  const notices = await getNotices();

  return <NoticeTable notices={notices} />;
}
