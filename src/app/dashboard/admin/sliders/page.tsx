"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaImage,
  FaPlus,
  FaTrash,
  FaEdit,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import FileUpload from "@/components/admin/FileUpload";
import initialSliders from "@/data/sliders.json";

interface Slider {
  id: number;
  title: string;
  image: string;
  sort_order: number;
}

const emptyForm = { title: "", image: "", sort_order: 0 };

export default function AdminSlidersPage() {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  // Instant render from pre-bundled sliders, verified against server
  const [sliders, setSliders] = useState<Slider[]>((initialSliders as Slider[]) || []);
  const [fetching, setFetching] = useState<boolean>(!initialSliders || initialSliders.length === 0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [moving, setMoving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    // Purge any stale slider cache from localStorage
    try {
      localStorage.removeItem("bahs_cached_sliders");
    } catch (e) {}

    if (!loading && (!user || user.role !== "admin")) router.replace("/login");
  }, [user, loading, router]);

  const loadSliders = async () => {
    if (sliders.length === 0) setFetching(true);
    try {
      const res = await fetch("/api/sliders");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sorted = [...data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        setSliders(sorted);
      }
    } catch (e) {
      console.error(e);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadSliders();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      alert(t("দয়া করে স্লাইডারের ছবি আপলোড করুন", "Please upload a slide image"));
      return;
    }
    setSaving(true);

    if (editId !== null) {
      // Optimistic update: instantly reflect changes on screen
      const updated = sliders.map((s) =>
        s.id === editId ? { ...s, title: form.title, image: form.image } : s
      );
      setSliders(updated);

      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      setSaveMsg(t("স্লাইডার সফলভাবে আপডেট হয়েছে", "Slide updated successfully"));
      setTimeout(() => setSaveMsg(""), 3000);

      // Save to server in background
      try {
        await fetch(`/api/sliders/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } catch (err) {
        console.error("Save slide error:", err);
      }
    } else {
      // New slide: create on server then add
      try {
        const res = await fetch("/api/sliders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, sort_order: sliders.length + 1 }),
        });
        const newSlide = await res.json();
        if (newSlide && newSlide.id) {
          const updated = [...sliders, newSlide];
          setSliders(updated);
        }
      } catch (err) {
        console.error("New slide error:", err);
      }
      setShowForm(false);
      setForm(emptyForm);
      setSaveMsg(t("নতুন স্লাইডার যুক্ত হয়েছে", "New slide added successfully"));
      setTimeout(() => setSaveMsg(""), 3000);
    }
    setSaving(false);
  };

  const handleEdit = (s: Slider) => {
    setForm({ title: s.title, image: s.image, sort_order: s.sort_order });
    setEditId(s.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("আপনি কি নিশ্চিতভাবে এই স্লাইডারটি মুছে ফেলতে চান?", "Are you sure you want to delete this slide?"))) return;

    // Optimistic removal: instantly removes from screen
    const updated = sliders.filter((s) => s.id !== id);
    setSliders(updated);
    setSaveMsg(t("স্লাইডারটি মুছে ফেলা হয়েছে", "Slide deleted successfully"));
    setTimeout(() => setSaveMsg(""), 3000);

    try {
      await fetch(`/api/sliders/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete slide error:", err);
      await loadSliders();
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (moving) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sliders.length) return;

    // Optimistically update the UI immediately
    const updated = [...sliders];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
    }));

    setSliders(reordered);
    setMoving(true);

    try {
      const res = await fetch("/api/sliders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reordered),
      });

      if (!res.ok) {
        await loadSliders();
      } else {
        setSaveMsg(t("স্লাইডারের ক্রম সফলভাবে পরিবর্তন হয়েছে", "Slider order updated successfully"));
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch (e) {
      console.error("Failed to reorder sliders", e);
      await loadSliders();
    } finally {
      setMoving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  };

  if (loading || !user) return null;

  return (
    <div className={`min-h-screen bg-gray-100 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
            <FaArrowLeft /> {t("ড্যাশবোর্ড", "Dashboard")}
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <FaImage className="text-blue-400" /> {t("হিরো স্লাইডার ব্যবস্থাপনা", "Hero Slider Management")}
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#051939]">
              {t("বিদ্যমান স্লাইডার সমূহ", "Existing Sliders")} ({sliders.length} {t("টি", "")})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t(
                "ছবিগুলো হোমপেজের প্রধান ব্যানারে প্রদর্শিত হবে। উপরে/নিচে তীরে ক্লিক করে স্লাইডগুলোর ক্রম পরিবর্তন করতে পারবেন।",
                "Images are displayed on the homepage hero banner. Click the Up/Down arrow buttons to reorder slides."
              )}
            </p>
          </div>
          <button
            onClick={() => { handleCancel(); setShowForm(!showForm); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow"
          >
            <FaPlus /> {t("নতুন স্লাইড যোগ করুন", "Add New Slide")}
          </button>
        </div>

        {saveMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 text-[#06874A] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all animate-fadeIn">
            <FaCheck className="shrink-0" />
            <span>{saveMsg}</span>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-blue-600">
            <h3 className="font-bold text-lg text-[#051939] mb-4">
              {editId ? t("স্লাইড আপডেট করুন", "Update Slide") : t("নতুন স্লাইড আপলোড করুন", "Upload New Slide")}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  {t("স্লাইডের টাইটেল / ক্যাপশন *", "Slide Title / Caption *")}
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder={t("যেমন: বার্ষিক পুরস্কার বিতরণী ও সাংস্কৃতিক অনুষ্ঠান", "e.g. Annual Sports & Cultural Competition")}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <FileUpload
                label={t("স্লাইডারের ছবি সিলেক্ট বা আপলোড করুন", "Select or Upload Slide Image")}
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                required={!editId}
                helpText={t("হোমপেজ স্লাইডারের জন্য পরিষ্কার ও চওড়া ছবি আপলোড করুন", "Upload a wide, high-resolution photo for the banner")}
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || (!form.image && !editId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-60 shadow"
                >
                  {saving
                    ? t("সংরক্ষণ হচ্ছে...", "Saving...")
                    : editId
                    ? t("আপডেট করুন", "Update Slide")
                    : t("স্লাইড প্রকাশ করুন", "Publish Slide")}
                </button>
                <button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm flex items-center gap-1.5">
                  <FaTimes size={12} /> {t("বাতিল", "Cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {fetching ? (
            <div className="text-center py-12 bg-white rounded-xl shadow text-gray-400">
              {t("লোড হচ্ছে...", "Loading...")}
            </div>
          ) : sliders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow text-gray-400">
              {t("কোনো স্লাইডার নেই।", "No sliders found.")}
            </div>
          ) : (
            sliders.map((s, index) => (
              <div
                key={s.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row items-center gap-4 hover:shadow-md transition"
              >
                {/* Up/Down Reorder Control */}
                <div className="flex md:flex-col items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 p-2 rounded-xl self-stretch md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || moving}
                    title={t("উপরে নিন (Move Up)", "Move Up")}
                    className="p-2 rounded-lg bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 disabled:opacity-25 disabled:cursor-not-allowed shadow-xs border border-gray-200 transition"
                  >
                    <FaArrowUp size={13} />
                  </button>
                  <div className="flex flex-col items-center justify-center px-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t("ক্রম", "No.")}</span>
                    <span className="text-sm font-extrabold text-[#051939] font-mono leading-none">
                      #{index + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === sliders.length - 1 || moving}
                    title={t("নিচে নিন (Move Down)", "Move Down")}
                    className="p-2 rounded-lg bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 disabled:opacity-25 disabled:cursor-not-allowed shadow-xs border border-gray-200 transition"
                  >
                    <FaArrowDown size={13} />
                  </button>
                </div>

                {/* Slide Preview Image */}
                <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-[#051939]/80 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded font-bold">
                    {t("স্লাইড", "Slide")} #{index + 1}
                  </span>
                </div>

                {/* Slide Info */}
                <div className="flex-1 w-full text-left min-w-0">
                  <span className="text-xs text-green-600 font-bold flex items-center gap-1 mb-1">
                    <FaCheck /> {t("লাইভ স্লাইড", "Live Slide")}
                  </span>
                  <h4 className="text-base font-bold text-gray-800 leading-snug">{s.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {s.image?.startsWith("data:") ? t("ছবি সংযুক্ত রয়েছে", "Image attached") : s.image}
                  </p>
                </div>

                {/* Edit / Delete Actions */}
                <div className="w-full md:w-auto flex items-center gap-2 justify-end">
                  <button
                    onClick={() => handleEdit(s)}
                    className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    <FaEdit size={13} /> {t("এডিট", "Edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    <FaTrash size={13} /> {t("মুছুন", "Delete")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
