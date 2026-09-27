"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaUserTie,
  FaPlus,
  FaTrash,
  FaEdit,
  FaArrowLeft,
  FaPhoneAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import FileUpload from "@/components/admin/FileUpload";

interface Staff {
  id: number;
  nameBengali: string;
  nameEnglish: string;
  designation: string;
  designationEn: string;
  phone?: string;
  photo?: string;
  order: number;
}

export default function AdminStaffPage() {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<Staff>>({
    nameBengali: "",
    nameEnglish: "",
    designation: "",
    designationEn: "",
    phone: "",
    photo: "",
    order: 0,
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.replace("/login");
  }, [user, loading, router]);

  const loadStaff = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/staff");
      if (res.ok) setStaffList(await res.json());
    } catch (e) {
      console.error(e);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadStaff();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameBengali || !form.designation) {
      alert("নাম ও পদবি অবশ্যই প্রদান করতে হবে");
      return;
    }

    setSaving(true);
    try {
      if (editId !== null) {
        await fetch(`/api/staff/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setEditId(null);
      } else {
        await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      setForm({
        nameBengali: "",
        nameEnglish: "",
        designation: "",
        designationEn: "",
        phone: "",
        photo: "",
        order: 0,
      });
      setShowForm(false);
      await loadStaff();
    } catch (err) {
      alert("সংরক্ষণ ব্যর্থ হয়েছে");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই কর্মচারীকে সরাতে চান?")) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    await loadStaff();
  };

  const handleEdit = (s: Staff) => {
    setForm(s);
    setEditId(s.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100 font-bengali pb-16">
      {/* Top Header */}
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin"
            className="text-gray-300 hover:text-white text-sm flex items-center gap-1.5 transition"
          >
            <FaArrowLeft /> {t("ড্যাশবোর্ড", "Dashboard")}
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <FaUserTie className="text-amber-400" />
            {t("কর্মচারী বৃন্দ ব্যবস্থাপনা", "Staff Management")}
          </h1>
        </div>

        <button
          onClick={() => {
            setForm({
              nameBengali: "",
              nameEnglish: "",
              designation: "",
              designationEn: "",
              phone: "",
              photo: "",
              order: staffList.length + 1,
            });
            setEditId(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-[#06874A] hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow"
        >
          {showForm ? <FaTimes /> : <FaPlus />}
          <span>{showForm ? t("বাতিল", "Cancel") : t("নতুন স্টাফ যোগ করুন", "Add New Staff")}</span>
        </button>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Form Modal / Accordion */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-t-4 border-[#06874A] animate-in fade-in duration-200">
            <h2 className="text-xl font-bold text-[#051939] mb-4">
              {editId !== null ? t("স্টাফ তথ্য সম্পাদনা", "Edit Staff Info") : t("নতুন স্টাফ যুক্ত করুন", "Add Staff Member")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    নাম (বাংলা) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nameBengali || ""}
                    onChange={(e) => setForm({ ...form, nameBengali: e.target.value })}
                    placeholder="উদাঃ মোঃ আবুল কালাম"
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Name (English)
                  </label>
                  <input
                    type="text"
                    value={form.nameEnglish || ""}
                    onChange={(e) => setForm({ ...form, nameEnglish: e.target.value })}
                    placeholder="e.g. Md. Abul Kalam"
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    পদবি (বাংলা) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.designation || ""}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    placeholder="উদাঃ অফিস সহকারী / নিরাপত্তাকর্মী"
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Designation (English)
                  </label>
                  <input
                    type="text"
                    value={form.designationEn || ""}
                    onChange={(e) => setForm({ ...form, designationEn: e.target.value })}
                    placeholder="e.g. Office Assistant / Security Guard"
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+88017xxxxxxxx"
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ক্রম নম্বর (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={form.order || 0}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white font-sans"
                  />
                </div>
              </div>

              {/* Photo Upload via FileUpload */}
              <div>
                <FileUpload
                  label="স্টাফের ছবি"
                  value={form.photo || ""}
                  onChange={(url: string) => setForm({ ...form, photo: url })}
                  helpText="আপনার ডিভাইস থেকে ছবি সিলেক্ট করুন"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-100 transition"
                >
                  {t("বাতিল", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#06874A] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition disabled:opacity-60 text-xs"
                >
                  <FaSave />
                  <span>{saving ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সংরক্ষণ করুন", "Save Staff")}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff Table / List */}
        <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-gradient-to-r from-[#051939] to-[#092b5e] text-white flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <FaUserTie className="text-yellow-400" />
              <span>{t("সকল কর্মচারী বৃন্দ তালিকা", "All Staff Members")}</span>
            </h3>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-bold">
              {t("মোট:", "Total:")} {staffList.length}
            </span>
          </div>

          {fetching ? (
            <div className="p-12 text-center text-gray-400">
              {t("লোড হচ্ছে...", "Loading staff list...")}
            </div>
          ) : staffList.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              {t("কোনো স্টাফ সদস্য পাওয়া যায়নি", "No staff found")}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {staffList.map((s) => (
                <div
                  key={s.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/80 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-emerald-500/30 shrink-0 shadow-sm">
                      {s.photo ? (
                        <img
                          src={s.photo}
                          alt={s.nameBengali}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                          <FaUserTie size={24} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-[#051939] text-base truncate">
                        {s.nameBengali}
                      </h4>
                      {s.nameEnglish && (
                        <p className="text-xs text-gray-400 font-sans truncate">
                          {s.nameEnglish}
                        </p>
                      )}
                      <p className="text-xs text-[#06874A] font-bold mt-0.5">
                        {s.designation} {s.designationEn ? `(${s.designationEn})` : ""}
                      </p>
                      {s.phone && (
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <FaPhoneAlt size={10} className="text-gray-400" />
                          <span>{s.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition border border-blue-200"
                      title="Edit"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200"
                      title="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
