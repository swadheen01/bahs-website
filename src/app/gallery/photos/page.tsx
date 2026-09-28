import type { Metadata } from "next";
import Image from "next/image";
import defaultGallery from "@/data/gallery.json";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "ফটোগ্যালারী | বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
};

export default async function PhotoGalleryPage() {
  let photos = defaultGallery;

  try {
    const { data } = await supabase.from('notices').select('*').eq('type', 'gallery').order('id', { ascending: false });
    if (data && data.length > 0) {
      const dbPhotos = data.map((item: any) => ({
        id: item.id,
        src: item.file_url,
        caption: item.title,
        category: item.added_by || "event",
        date: item.date || "২০২৬"
      }));
      photos = [...dbPhotos, ...defaultGallery];
    }
  } catch (err) {
    console.error("Error fetching gallery:", err);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Page Banner */}
      <div className="bg-[#465b6a] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-bengali">ফটোগ্যালারী</h1>
          <div className="w-16 h-1 bg-[#06874A] mx-auto mt-3 mb-2 rounded-full"></div>
          <p className="text-gray-200 font-bengali text-sm">
            বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের বিভিন্ন কার্যক্রমের খণ্ডচিত্র
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <div
              key={`${photo.id}-${index}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <p className="text-sm font-bold text-gray-800 font-bengali leading-snug group-hover:text-[#06874A] transition-colors">
                  {photo.caption}
                </p>
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-bengali">
                  <span>বানিয়াচং আদর্শ উচ্চ বিদ্যালয়</span>
                  <span className="text-[#06874A]">গ্যালারী</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
