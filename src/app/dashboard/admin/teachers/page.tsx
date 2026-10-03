"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaChalkboardTeacher, FaSignOutAlt, FaPlus, FaTrash, FaEdit, FaArrowLeft, FaBell, FaCheck, FaTimes } from "react-icons/fa";
import FileUpload from "@/components/admin/FileUpload";

interface Teacher {
  id: number;
  nameBengali: string;
  nameEnglish: string;
  designation: string;
  designationEn: string;
  subject: string;
  category: "management" | "faculty";
  photo: string;
  order: number;
  mpoIndex?: string;
  joiningDate?: string;
  birthDate?: string;
  email?: string;
  contactNo?: string;
  qualification?: string;
  experience?: string;
  interest?: string;
  presentAddress?: string;
  permanentAddress?: string;
  mainSubject?: string;
  courses?: string;
  hasPendingEdit?: boolean;
  pendingEditData?: any;
}

const emptyForm: Partial<Teacher> = {
  nameBengali: "", nameEnglish: "", designation: "", designationEn: "", subject: "", category: "faculty", photo: "", order: 0,
  mpoIndex: "", joiningDate: "", birthDate: "", email: "", contactNo: "", qualification: "", experience: "", interest: "", presentAddress: "", permanentAddress: "", mainSubject: "", courses: ""
};

export default function AdminTeachersPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Teacher>>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.replace("/login");
  }, [user, loading, router]);

  const loadTeachers = async () => {
    setFetching(true);
    const res = await fetch("/api/teachers");
    if (res.ok) setTeachers(await res.json());
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadTeachers();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editId !== null) {
      await fetch(`/api/teachers/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditId(null);
    } else {
      await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
    await loadTeachers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("এই শিক্ষককে তালিকা থেকে সরাবেন?")) return;
    await fetch(`/api/teachers/${id}`, { method: "DELETE" });
    await loadTeachers();
  };

  const handleApprove = async (id: number) => {
    await fetch(`/api/teachers/${id}/approve`, { method: "POST" });
    await loadTeachers();
  };

  const handleReject = async (id: number) => {
    if (!confirm("এই পরিবর্তন প্রত্যাখ্যান করবেন?")) return;
    await fetch(`/api/teachers/${id}/reject`, { method: "POST" });
    await loadTeachers();
  };

  const handleEdit = (t: Teacher) => {
    setForm(t);
    setEditId(t.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100 font-bengali">
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
            <FaArrowLeft /> ড্যাশবোর্ড
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <FaChalkboardTeacher className="text-[#06874A]" /> শিক্ষক ব্যবস্থাপনা
          </h1>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex items-center gap-2 bg-[#800505] px-3 py-1.5 rounded text-sm hover:bg-red-700"
        >
          <FaSignOutAlt /> লগআউট
        </button>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {teachers.some(t => t.hasPendingEdit) && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <FaBell className="text-amber-600 mt-0.5 shrink-0" size={18} />
              <div>
                <p className="font-bold text-amber-900 text-sm">শিক্ষকের তথ্য পরিবর্তনের আবেদন</p>
                <p className="text-xs text-amber-700 mt-0.5">নিচের আবেদনগুলো পর্যালোচনা করে অ্যাপ্রুভ বা রিজেক্ট করুন।</p>
              </div>
            </div>
            <div className="space-y-3">
              {teachers.filter(t => t.hasPendingEdit).map(t => {
                const pendingData = typeof t.pendingEditData === 'string' 
                  ? JSON.parse(t.pendingEditData) 
                  : t.pendingEditData || {};
                
                // Fields mapping
                const fieldMap: Record<string, string> = {
                  nameEnglish: "নাম (ইংরেজিতে)",
                  email: "ইমেইল",
                  contactNo: "যোগাযোগ নম্বর",
                  qualification: "শিক্ষাগত যোগ্যতা",
                  experience: "অভিজ্ঞতা",
                  mainSubject: "প্রধান বিষয়",
                  courses: "কোর্স ও প্রশিক্ষণ",
                  presentAddress: "বর্তমান ঠিকানা",
                  permanentAddress: "স্থায়ী ঠিকানা",
                  photo: "প্রোফাইল ছবি"
                };

                return (
                  <div key={t.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg border border-amber-200 shadow-sm gap-4">
                    <div className="flex-1 w-full">
                      <p className="font-bold text-sm text-gray-800">{t.nameBengali}</p>
                      <p className="text-xs text-gray-500 mb-3">{t.designation}{t.mainSubject ? ` (${t.mainSubject})` : ''}</p>
                      
                      {/* Show Changes */}
                      <div className="bg-gray-50 p-3 rounded border border-gray-100 space-y-1">
                        <p className="text-[11px] font-bold uppercase text-gray-400 mb-2 border-b pb-1">প্রস্তাবিত পরিবর্তনসমূহ:</p>
                        {Object.entries(pendingData).map(([key, val]) => {
                          if (!val && !(t as any)[key]) return null;
                          return (
                            <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 text-xs">
                              <span className="text-gray-500 font-medium">{fieldMap[key] || key}:</span>
                              <span className="sm:col-span-2 text-blue-700 font-semibold break-words">{String(val)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                      <button onClick={() => handleApprove(t.id)} className="flex-1 flex justify-center items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-bold transition shadow-sm">
                        <FaCheck size={12} /> অ্যাপ্রুভ
                      </button>
                      <button onClick={() => handleReject(t.id)} className="flex-1 flex justify-center items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-xs font-bold transition shadow-sm">
                        <FaTimes size={12} /> রিজেক্ট
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#051939]">সকল শিক্ষকবৃন্দের তালিকা ({teachers.length} জন)</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditId(null);
              setForm({ ...emptyForm, order: teachers.length + 1 });
            }}
            className="flex items-center gap-2 bg-[#06874A] text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition shadow"
          >
            <FaPlus /> নতুন শিক্ষক যোগ করুন
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-[#06874A]">
            <h3 className="font-bold text-lg text-[#051939] mb-4">
              {editId ? "শিক্ষকের তথ্য আপডেট করুন" : "নতুন শিক্ষক যোগ করুন"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">নাম (বাংলায়) *</label>
                  <input
                    type="text"
                    value={form.nameBengali || ""}
                    onChange={(e) => setForm({ ...form, nameBengali: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#051939]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">নাম (ইংরেজিতে)</label>
                  <input
                    type="text"
                    value={form.nameEnglish || ""}
                    onChange={(e) => setForm({ ...form, nameEnglish: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-sans focus:ring-2 focus:ring-[#051939]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">পদবি (বাংলায়) *</label>
                  <input
                    type="text"
                    value={form.designation || ""}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#051939]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">প্রধান বিষয় (Bracket-এ দেখাবে)</label>
                  <input
                    type="text"
                    value={form.mainSubject || ""}
                    onChange={(e) => setForm({ ...form, mainSubject: e.target.value })}
                    placeholder="ICT, গণিত, বাংলা"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#051939]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">বিষয় (যদি থাকে)</label>
                  <input
                    type="text"
                    value={form.subject || ""}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#051939]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="faculty">সাধারণ শিক্ষক (Faculty)</option>
                    <option value="management">ব্যবস্থাপনা ও স্টাফ (Management)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ক্রম নম্বর (Order)</label>
                  <input
                    type="number"
                    value={form.order || 0}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* Direct File Upload */}
              <div className="pt-2 border-t border-gray-100">
                <FileUpload
                  label="শিক্ষকের ছবি আপলোড করুন"
                  value={form.photo || ""}
                  onChange={(url) => setForm({ ...form, photo: url })}
                  helpText="আপনার ডিভাইস থেকে শিক্ষকের পাসপোর্ট সাইজ ছবি নির্বাচন করুন"
                />
              </div>

              {/* Extended Profile Fields */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">বিস্তারিত প্রোফাইল তথ্য (ঐচ্ছিক)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Qualification</label>
                    <input type="text" value={form.qualification || ""} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="M.A., B.Ed." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Courses & Training</label>
                    <textarea value={form.courses || ""} onChange={(e) => setForm({ ...form, courses: e.target.value })} placeholder="মাস্টার ট্রেইনার (UITRCE)&#10;কারিকুলাম মাস্টার ট্রেইনার&#10;ICT4E জেলা শিক্ষক এ্যাম্বাসেডর, হবিগঞ্জ" rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">MPO Index Number</label>
                    <input type="text" value={form.mpoIndex || ""} onChange={(e) => setForm({ ...form, mpoIndex: e.target.value })} placeholder="n/a" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Joining Date</label>
                    <input type="text" value={form.joiningDate || ""} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} placeholder="01 Jan, 2010" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Birth Date</label>
                    <input type="text" value={form.birthDate || ""} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} placeholder="10 Feb, 1982" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                    <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Contact No.</label>
                    <input type="text" value={form.contactNo || ""} onChange={(e) => setForm({ ...form, contactNo: e.target.value })} placeholder="01700000000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Experience</label>
                    <input type="text" value={form.experience || ""} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="15 Years" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Interest / Subjects</label>
                    <input type="text" value={form.interest || ""} onChange={(e) => setForm({ ...form, interest: e.target.value })} placeholder="BANGLA, ENGLISH, MATH" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Present Address</label>
                    <input type="text" value={form.presentAddress || ""} onChange={(e) => setForm({ ...form, presentAddress: e.target.value })} placeholder="Vill-..., P.O-..., Baniyachong, Dist.-Hobigonj" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Permanent Address</label>
                    <input type="text" value={form.permanentAddress || ""} onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} placeholder="Vill-..., P.O-..., Baniyachong, Dist.-Hobigonj" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#06874A] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-60 shadow"
                >
                  {saving ? "সংরক্ষণ হচ্ছে..." : editId ? "আপডেট করুন" : "যোগ করুন"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {fetching ? (
            <div className="text-center py-10 text-gray-400">লোড হচ্ছে...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#051939] text-white">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">ছবি</th>
                  <th className="px-4 py-3 text-left">নাম</th>
                  <th className="px-4 py-3 text-left">পদবি ও বিষয়</th>
                  <th className="px-4 py-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teachers.map((t, i) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden border border-gray-200 relative">
                        {t.photo ? (
                          <img src={t.photo} className="w-full h-full object-cover" alt={t.nameBengali} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">ছবি নেই</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">
                      <div className="flex items-center gap-2">
                        {t.nameBengali}
                        {t.hasPendingEdit && (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            পরিবর্তন
                          </span>
                        )}
                      </div>
                      {t.nameEnglish && <p className="text-xs font-sans text-gray-400 font-normal">{t.nameEnglish}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.designation}{t.mainSubject ? ` (${t.mainSubject})` : ''}
                      {t.subject && <span className="block text-xs text-[#06874A]">{t.subject}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                          title="এডিট করুন"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                          title="মুছে ফেলুন"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
