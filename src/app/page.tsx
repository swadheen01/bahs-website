import { supabase } from "@/lib/supabase";
import HomeClient from "./HomeClient";

// The home page reads live school content. Render it per request instead of
// persisting ISR artifacts on every invalidation.
export const dynamic = "force-dynamic";

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
