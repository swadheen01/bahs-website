"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUserTie, FaPlus, FaTrash, FaEdit, FaArrowLeft, FaSave, FaTimes } from "react-icons/fa";
import FileUpload from "@/components/admin/FileUpload";

interface FormerStaff {
  id: string;
  name: string;
  nameEn: string;
  designation: string;
  designationEn: string;
  tenure: string;
  photo: string;
}

export default function AdminFormerStaffPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  const [headmasters, setHeadmasters] = useState<FormerStaff[]>([]);
  const [teachers, setTeachers] = useState<FormerStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"headmaster" | "teacher">("headmaster");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    nameEn: "",
    designation: "",
    designationEn: "",
    tenure: "",
    photo: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/former-staff");
      const data = await res.json();
      setHeadmasters(data.headmasters || []);
      setTeachers(data.teachers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setEditId(null);
    setForm({
      name: "",
      nameEn: "",
      designation: activeTab === "headmaster" ? "প্রাক্তন প্রধান শিক্ষক" : "প্রাক্তন শিক্ষক",
      designationEn: activeTab === "headmaster" ? "Former Headmaster" : "Former Teacher",
      tenure: "",
      photo: "",
    });
    setIsFormOpen(true);
  };

  const openEditForm = (item: FormerStaff) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      nameEn: item.nameEn,
      designation: item.designation,
      designationEn: item.designationEn,
      tenure: item.tenure,
      photo: item.photo,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.tenure) return alert(t("দয়া করে নাম এবং কর্মকাল লিখুন", "Please enter name and tenure"));

    setSaving(true);
    try {
      const payload = {
        action: editId ? "edit" : "add",
        id: editId,
        category: activeTab,
        ...form
      };

      const res = await fetch("/api/former-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchData();
      } else {
        alert(t("ব্যর্থ হয়েছে", "Failed"));
      }
    } catch (error) {
      console.error(error);
      alert(t("ত্রুটি হয়েছে", "An error occurred"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("আপনি কি নিশ্চিত?", "Are you sure?"))) return;

    try {
      const res = await fetch("/api/former-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id, category: activeTab }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user || user.role !== "admin") return null;

  const currentList = activeTab === "headmaster" ? headmasters : teachers;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 transition"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {t("সাবেক শিক্ষকমণ্ডলী", "Former Faculty Management")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("সাবেক প্রধান শিক্ষক ও অন্যান্য শিক্ষকদের তালিকা", "Manage former headmasters and teachers")}
            </p>
          </div>
        </div>
        {!isFormOpen && (
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-[#06874A] hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition"
          >
            <FaPlus size={14} />
            <span>{t("নতুন যুক্ত করুন", "Add New")}</span>
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setActiveTab("headmaster"); setIsFormOpen(false); }}
          className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === "headmaster" ? "bg-[#051939] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          {t("প্রাক্তন প্রধান শিক্ষক", "Former Headmasters")}
        </button>
        <button
          onClick={() => { setActiveTab("teacher"); setIsFormOpen(false); }}
          className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === "teacher" ? "bg-[#051939] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          {t("প্রাক্তন অন্যান্য শিক্ষক", "Other Former Teachers")}
        </button>
      </div>

      {isFormOpen ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              {editId ? t("তথ্য আপডেট করুন", "Update Info") : t("নতুন তথ্য যুক্ত করুন", "Add New Info")}
            </h2>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("নাম (বাংলা)", "Name (Bengali)")} *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#06874A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("নাম (English)", "Name (English)")}
                </label>
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#06874A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("পদবি (বাংলা)", "Designation (Bengali)")} *
                </label>
                <input
                  required
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#06874A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("পদবি (English)", "Designation (English)")}
                </label>
                <input
                  type="text"
                  value={form.designationEn}
                  onChange={(e) => setForm({ ...form, designationEn: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#06874A]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("কর্মকাল (কত সাল থেকে কত সাল)", "Tenure (e.g. 1985 - 1995)")} *
                </label>
                <input
                  required
                  type="text"
                  value={form.tenure}
                  onChange={(e) => setForm({ ...form, tenure: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#06874A]"
                  placeholder="১৯৮৫ - ১৯৯৫"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("ছবি", "Photo")}
                </label>
                <div className="flex items-end gap-6">
                  <div className="w-24 h-32 rounded-xl border-2 border-gray-200 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                    {form.photo ? (
                      <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FaUserTie size={30} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <FileUpload
                      label={t("পাসপোর্ট সাইজের ছবি আপলোড করুন", "Upload passport size photo")}
                      value={form.photo}
                      onChange={(url: string) => setForm({ ...form, photo: url })}
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#06874A] hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-70"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaSave size={16} />
                    <span>{t("সেভ করুন", "Save Info")}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                disabled={saving}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition disabled:opacity-70"
              >
                {t("বাতিল করুন", "Cancel")}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="w-8 h-8 border-4 border-[#06874A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-16">
              <FaUserTie size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">{t("কোনো তথ্য পাওয়া যায়নি", "No records found")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase">{t("ছবি", "Photo")}</th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase">{t("নাম ও পদবি", "Name & Designation")}</th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase">{t("কর্মকাল", "Tenure")}</th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase text-right">{t("অ্যাকশন", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                          <img
                            src={item.photo || "/images/teachers/default_avatar.png"}
                            alt={item.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-800">{language === "en" ? item.nameEn : item.name}</p>
                        <p className="text-xs text-gray-500">{language === "en" ? item.designationEn : item.designation}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold font-mono">
                          {item.tenure}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditForm(item)}
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition"
                            title={t("এডিট করুন", "Edit")}
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition"
                            title={t("ডিলিট করুন", "Delete")}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
