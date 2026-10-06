import type { Metadata } from "next";
import defaultGallery from "@/data/gallery.json";
import { supabase } from "@/lib/supabase";
import PhotoGalleryClient from "./PhotoGalleryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ফটোগ্যালারী | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
};

export default async function PhotoGalleryPage() {
  let photos: any[] = [];

  try {
    const { data } = await supabase
      .from("notices")
      .select("*")
      .eq("type", "gallery")
      .order("id", { ascending: false });

    if (data && data.length > 0) {
      photos = data.map((item: any) => ({
        id: item.id,
        src: item.file_url,
        caption: item.title,
        category: item.added_by || "event",
        date: item.date || "২০২৬",
      }));
    } else {
      photos = defaultGallery;
    }
  } catch (err) {
    console.error("Error fetching gallery:", err);
    photos = defaultGallery;
  }

  return <PhotoGalleryClient photos={photos} />;
}

