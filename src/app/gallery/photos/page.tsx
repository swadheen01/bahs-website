import type { Metadata } from "next";
import { getGalleryItems } from "@/lib/publicData";
import PhotoGalleryClient from "./PhotoGalleryClient";

// Prerendered at build; the gallery refreshes from /api/gallery in the browser.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "ফটোগ্যালারী | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
};

export default async function PhotoGalleryPage() {
  const items = await getGalleryItems();
  const photos = items.map((item: any) => ({
    id: item.id,
    src: item.image,
    caption: item.title,
    category: item.category || "event",
    date: item.date || "২০২৬",
  }));

  return <PhotoGalleryClient photos={photos} />;
}
