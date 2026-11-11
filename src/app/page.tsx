import { supabase } from "@/lib/supabase";
import defaultSliders from "@/data/sliders.json";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("type", "slider")
    .order("id", { ascending: true });
  
  let sliders: any[] = [];
  
  if (!error && Array.isArray(data)) {
    sliders = data.map((s: any) => ({
      id: s.id,
      title: s.title || "",
      image: s.file_url,
      sort_order: Number(s.added_by) || 0,
    })).sort((a: any, b: any) => a.sort_order - b.sort_order);
  } else {
    sliders = defaultSliders;
  }

  return <HomeClient initialSliders={sliders} />;
}
