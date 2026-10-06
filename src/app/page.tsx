import { supabase } from "@/lib/supabase";
import HomeClient from "./HomeClient";

export const revalidate = 86400; // 24h ISR, revalidated on-demand when content changes

export default async function Page() {
  const { data } = await supabase
    .from("notices")
    .select("*")
    .eq("type", "slider")
    .order("id", { ascending: true });
  
  let sliders: any[] = [];
  
  if (data && Array.isArray(data)) {
    sliders = data.map((s: any) => ({
      id: s.id,
      title: s.title || "",
      image: s.file_url,
      sort_order: Number(s.added_by) || 0,
    })).sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  return <HomeClient initialSliders={sliders} />;
}
