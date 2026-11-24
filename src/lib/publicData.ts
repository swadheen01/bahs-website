/**
 * Server-side readers for PUBLIC website data.
 *
 * Used by:
 *  - public API routes (GET), and
 *  - static pages at build time (so pages can be prerendered and served from cache
 *    on Cloudflare without running React on every visit).
 *
 * Every reader falls back to the bundled JSON snapshot in src/data if Supabase is unreachable.
 */
import { supabaseAdmin as supabase } from "./supabaseServer";
import { noticesDB, teachersDB, alumniDB, type Notice, type Teacher, type Alumni } from "./db";
import schoolInfoSnapshot from "@/data/school-info.json";
import slidersSnapshot from "@/data/sliders.json";
import teachersSnapshot from "@/data/teachers.json";
import alumniSnapshot from "@/data/alumni.json";
import gallerySnapshot from "@/data/gallery.json";
import noticesSnapshot from "@/data/notices.json";

/**
 * Browser cache for public GET APIs. Visitors re-use a response for 60s (and may show a stale copy
 * for up to 5 minutes while refreshing), which removes most repeat Worker invocations.
 * Admin dashboards fetch with `cache: "no-store"`, which bypasses this, so admins always see fresh data.
 */
export const PUBLIC_CACHE_HEADER = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};
export const NO_STORE_HEADER = { "Cache-Control": "no-store" };

// ─── School info ──────────────────────────────────────────────────────────
export async function getSchoolInfo(): Promise<any> {
  let data: any = { ...(schoolInfoSnapshot as any) };
  try {
    const { data: rows, error } = await supabase
      .from("notices")
      .select("file_url, added_by")
      .eq("type", "school_info")
      .order("id", { ascending: false })
      .limit(1);
    if (error) throw error;
    if (rows && rows.length > 0) {
      const payload = rows[0].file_url || rows[0].added_by || "{}";
      data = { ...data, ...JSON.parse(payload) };
    }
  } catch (e) {
    console.error("school-info fetch error, using snapshot:", e);
  }
  return data;
}

// ─── Sliders ──────────────────────────────────────────────────────────────
export interface Slide {
  id: number;
  title: string;
  image: string;
  sort_order: number;
}

export async function getSliders(): Promise<Slide[]> {
  try {
    const { data, error } = await supabase
      .from("notices")
      .select("id, title, file_url, added_by")
      .eq("type", "slider")
      .order("id", { ascending: true });
    if (error) throw error;
    return (data || [])
      .map((s: any) => ({
        id: s.id,
        title: s.title || "",
        image: s.file_url,
        sort_order: Number(s.added_by) || 0,
      }))
      .sort((a, b) => a.sort_order - b.sort_order || Number(a.id) - Number(b.id));
  } catch (e) {
    console.error("sliders fetch error, using snapshot:", e);
    return [...(slidersSnapshot as Slide[])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }
}

// ─── Notices ──────────────────────────────────────────────────────────────
/** URL that serves a notice attachment which is stored inline (base64) in the database. */
export function noticeFileUrl(id: number) {
  return `/api/notices/${id}/file`;
}

/**
 * Public notice list. Inline base64 attachments are replaced by a small URL so the list stays tiny
 * (a single attachment used to add hundreds of KB to every homepage visit).
 */
export async function getNotices(): Promise<Notice[]> {
  try {
    const notices = await noticesDB.getAll();
    return notices.map((n) => ({
      ...n,
      fileUrl: n.fileUrl && n.fileUrl.startsWith("data:") ? noticeFileUrl(n.id) : n.fileUrl,
    }));
  } catch (e) {
    console.error("notices fetch error, using snapshot:", e);
    return noticesSnapshot as Notice[];
  }
}

// ─── Teachers ─────────────────────────────────────────────────────────────
const PRIVATE_TEACHER_FIELDS = [
  "hasPendingEdit",
  "pendingEditData",
  "pendingEditSubmittedBy",
  "pendingEditSubmittedAt",
] as const;

/** Removes unapproved pending-edit data before sending a teacher to the public. */
export function toPublicTeacher<T extends Record<string, any>>(t: T): T {
  const copy: any = { ...t };
  for (const f of PRIVATE_TEACHER_FIELDS) delete copy[f];
  delete copy.has_pending_edit;
  delete copy.pending_edit_data;
  delete copy.pending_edit_submitted_by;
  delete copy.pending_edit_submitted_at;
  return copy;
}

export async function getTeachers(options: { includePending?: boolean } = {}): Promise<Teacher[]> {
  try {
    const teachers = await teachersDB.getAll();
    return options.includePending ? teachers : teachers.map(toPublicTeacher);
  } catch (e) {
    console.error("teachers fetch error, using snapshot:", e);
    return teachersSnapshot as unknown as Teacher[];
  }
}

/** Raw (snake_case) teacher row as used by the teacher profile page, without pending-edit data. */
export async function getTeacherRow(id: number | string): Promise<any | null> {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return null;
  try {
    const { data, error } = await supabase.from("teachers").select("*").eq("id", numId).maybeSingle();
    if (error) throw error;
    return data ? toPublicTeacher(data) : null;
  } catch (e) {
    console.error("teacher fetch error:", e);
    return null;
  }
}

// ─── Alumni ───────────────────────────────────────────────────────────────
export async function getAlumni(): Promise<Alumni[]> {
  try {
    return await alumniDB.getAll();
  } catch (e) {
    console.error("alumni fetch error, using snapshot:", e);
    return alumniSnapshot as unknown as Alumni[];
  }
}

// ─── Gallery ──────────────────────────────────────────────────────────────
/** Gallery items in the shape returned by GET /api/gallery. */
export async function getGalleryItems(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("notices")
      .select("id, title, file_url, added_by, date, date_iso")
      .eq("type", "gallery")
      .order("id", { ascending: false });
    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title || "গ্যালারি ছবি",
      image: item.file_url,
      category: item.added_by || "campus",
      date: item.date || "২০২৬",
      created_at: item.date_iso || item.date || "",
    }));
  } catch (e) {
    console.error("gallery fetch error, using snapshot:", e);
    return (gallerySnapshot as any[]).map((item: any) => ({
      id: item.id,
      title: item.caption || item.title || "গ্যালারি ছবি",
      image: item.src || item.image,
      category: item.category || "campus",
      date: item.date || "২০২৬",
      created_at: item.date || "",
    }));
  }
}

// ─── Homepage bundle ──────────────────────────────────────────────────────
/** Everything the homepage needs, in ONE request (was 8 separate API calls per visit). */
export async function getHomeData() {
  const [sliders, schoolInfo, notices, teachers, alumni] = await Promise.all([
    getSliders(),
    getSchoolInfo(),
    getNotices(),
    getTeachers(),
    getAlumni(),
  ]);
  return {
    sliders,
    schoolInfo,
    notices: notices.slice(0, 12),
    teachers: teachers.slice(0, 12),
    alumni,
  };
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;
