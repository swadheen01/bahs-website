"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaChalkboardTeacher, FaSignOutAlt, FaHome, FaBullhorn, FaBook, FaUserEdit, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import FileUpload from "@/components/admin/FileUpload";

export default function TeacherDashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!loading && (!user || (user.role !== "teacher" && user.role !== "admin"))) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const fetchProfile = async () => {
    if (user?.teacherId) {
      const res = await fetch(`/api/teachers/${user.teacherId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditForm({
          nameEnglish: data.name_english || "",
          photo: data.photo || "",
          email: data.email || "",
          contactNo: data.contact_no || "",
          qualification: data.qualification || "",
          experience: data.experience || "",
          mainSubject: data.main_subject || "",
          courses: data.courses || "",
          presentAddress: data.present_address || "",
          permanentAddress: data.permanent_address || "",
        });
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch(`/api/teachers/${user?.teacherId}/pending-edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setIsSubmitting(false);
    if (res.ok) {
      setSuccessMsg("আপনার পরিবর্তনের আবেদন এডমিনের কাছে পাঠানো হয়েছে। অনুমোদনের পর পরিবর্তন দেখা যাবে।");
      setIsEditing(false);
      fetchProfile();
    } else {
      alert("Submission failed. Please try again.");
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100 font-bengali">
      <header className="bg-[#06874A] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <FaChalkboardTeacher size={24} />
          <div>
            <h1 className="text-lg font-bold">শিক্ষক ড্যাশবোর্ড</h1>
            <p className="text-xs text-green-100">স্বাগতম, {user.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="bg-white/10 hover:bg-white/20 text-xs px-3 py-2 rounded-lg flex items-center gap-1">
            <FaHome /> হোমপেজ
          </Link>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="bg-red-600 hover:bg-red-700 text-xs px-3 py-2 rounded-lg flex items-center gap-1"
          >
            <FaSignOutAlt /> লগআউট
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-[#051939] mb-2">স্বাগতম, {user.name}!</h2>
          <p className="text-sm text-gray-600">আপনি বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের শিক্ষক প্যানেলে সফলভাবে লগইন করেছেন।</p>
        </div>
        
        {successMsg && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-6 flex items-start gap-3">
            <FaCheckCircle className="text-green-600 mt-0.5 shrink-0" size={18} />
            <p className="font-bold text-green-900 text-sm">{successMsg}</p>
          </div>
        )}

        {profile?.has_pending_edit && !successMsg && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6 flex items-start gap-3">
            <FaExclamationTriangle className="text-amber-600 mt-0.5 shrink-0" size={18} />
            <p className="font-bold text-amber-900 text-sm">আপনার পরিবর্তনের আবেদন এডমিনের অনুমোদনের অপেক্ষায় আছে।</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#051939] border-b pb-2 flex-1">আমার প্রোফাইল</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-sm hover:bg-blue-100 transition">
                    <FaUserEdit /> এডিট করুন
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">নাম (ইংরেজিতে)</label>
                      <input type="text" value={editForm.nameEnglish} onChange={(e) => setEditForm({ ...editForm, nameEnglish: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">ইমেইল</label>
                      <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">যোগাযোগ নম্বর</label>
                      <input type="text" value={editForm.contactNo} onChange={(e) => setEditForm({ ...editForm, contactNo: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">শিক্ষাগত যোগ্যতা</label>
                      <input type="text" value={editForm.qualification} onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">অভিজ্ঞতা</label>
                      <input type="text" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">প্রধান বিষয়</label>
                      <input type="text" value={editForm.mainSubject} onChange={(e) => setEditForm({ ...editForm, mainSubject: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">কোর্স ও প্রশিক্ষণ</label>
                      <textarea value={editForm.courses} onChange={(e) => setEditForm({ ...editForm, courses: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">বর্তমান ঠিকানা</label>
                      <input type="text" value={editForm.presentAddress} onChange={(e) => setEditForm({ ...editForm, presentAddress: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">স্থায়ী ঠিকানা</label>
                      <input type="text" value={editForm.permanentAddress} onChange={(e) => setEditForm({ ...editForm, permanentAddress: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <FileUpload label="প্রোফাইল ছবি" value={editForm.photo} onChange={(url) => setEditForm({ ...editForm, photo: url })} helpText="নতুন ছবি আপলোড করুন" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t mt-4">
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700">
                      {isSubmitting ? "সাবমিট হচ্ছে..." : "সাবমিট করুন"}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
                      বাতিল
                    </button>
                  </div>
                </form>
              ) : profile ? (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  {/* Formal Header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-bold text-[#051939]">ব্যক্তিগত তথ্যাবলী</h3>
                    <p className="text-xs text-gray-500 mt-1">আপনার প্রোফাইলের বর্তমান তথ্য নিচে দেওয়া হলো।</p>
                  </div>
                  
                  {/* Details List */}
                  <div className="divide-y divide-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-semibold text-gray-600">নাম (বাংলায়)</div>
                      <div className="text-sm text-gray-800 sm:col-span-2 font-medium">{profile.name_bengali}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-semibold text-gray-600">নাম (ইংরেজিতে)</div>
                      <div className="text-sm text-gray-800 sm:col-span-2 font-sans font-medium">{profile.name_english || "-"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-semibold text-gray-600">পদবি</div>
                      <div className="text-sm text-gray-800 sm:col-span-2 font-medium">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">
                          {profile.designation}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-semibold text-gray-600">প্রধান বিষয়</div>
                      <div className="text-sm text-gray-800 sm:col-span-2 font-medium">{profile.main_subject || "-"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-semibold text-gray-600">ইমেইল</div>
                      <div className="text-sm text-gray-800 sm:col-span-2 font-sans">{profile.email || "-"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-semibold text-gray-600">যোগাযোগ নম্বর</div>
                      <div className="text-sm text-gray-800 sm:col-span-2 font-mono">{profile.contact_no || "-"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-semibold text-gray-600">শিক্ষাগত যোগ্যতা</div>
                      <div className="text-sm text-gray-800 sm:col-span-2 font-medium leading-relaxed">{profile.qualification || "-"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-semibold text-gray-600">অভিজ্ঞতা</div>
                      <div className="text-sm text-gray-800 sm:col-span-2 font-medium">{profile.experience || "-"}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-semibold text-gray-600">কোর্স ও প্রশিক্ষণ</div>
                      <div className="text-sm text-gray-800 sm:col-span-2">
                        {profile.courses ? (
                          <ul className="list-disc list-inside space-y-1.5">
                            {profile.courses.split('\n').map((course: string, i: number) => (
                              <li key={i} className="leading-relaxed text-gray-700">{course.trim()}</li>
                            ))}
                          </ul>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">প্রোফাইল লোড হচ্ছে...</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <Link href="/notices" className="block bg-white p-5 rounded-xl shadow border-l-4 border-amber-500 hover:shadow-md transition">
              <FaBullhorn size={24} className="text-amber-500 mb-2" />
              <h3 className="font-bold text-gray-800">নোটিশসমূহ দেখুন</h3>
              <p className="text-xs text-gray-500 mt-1">বিদ্যালয়ের সাম্প্রতিক সকল বিজ্ঞপ্তি ও রুটিন দেখুন</p>
            </Link>
            <Link href="/academics/routine" className="block bg-white p-5 rounded-xl shadow border-l-4 border-blue-500 hover:shadow-md transition">
              <FaBook size={24} className="text-blue-500 mb-2" />
              <h3 className="font-bold text-gray-800">ক্লাস রুটিন</h3>
              <p className="text-xs text-gray-500 mt-1">সাপ্তাহিক ক্লাসের সময়সূচী ও বিষয়ভিত্তিক তথ্য</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

