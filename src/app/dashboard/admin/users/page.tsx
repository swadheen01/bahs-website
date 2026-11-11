"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaUsers,
  FaArrowLeft,
  FaUserShield,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaSearch,
  FaCrown,
  FaKey,
  FaTrash,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";

export default function AdminUsersPage() {
  const { user: currentUser, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "teacher" | "student">("all");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Role Change Confirmation Modal State
  const [roleModalUser, setRoleModalUser] = useState<any | null>(null);
  const [targetRole, setTargetRole] = useState<"admin" | "teacher" | "student">("admin");
  const [roleUpdating, setRoleUpdating] = useState(false);

  // Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  useEffect(() => {
    if (!loading && (!currentUser || currentUser.role !== "admin")) {
      router.replace("/login");
    }
  }, [currentUser, loading, router]);

  const loadUsers = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        const data = await res.json().catch(() => ({}));
        setStatusMsg({ type: "error", text: data.error || "ব্যবহারকারীদের তথ্য লোড করা যায়নি।" });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: "error", text: "সার্ভার থেকে তথ্য লোড করা যায়নি।" });
    }
    setFetching(false);
  };

  useEffect(() => {
    if (currentUser?.role === "admin") loadUsers();
  }, [currentUser]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Counts
  const adminCount = users.filter((u) => u.role === "admin").length;
  const teacherCount = users.filter((u) => u.role === "teacher").length;
  const studentCount = users.filter((u) => u.role === "student").length;

  const handleRoleChangeConfirm = async () => {
    if (!roleModalUser) return;
    setRoleUpdating(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/users/${roleModalUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });

      if (res.ok) {
        setStatusMsg({
          type: "success",
          text: `"${roleModalUser.name}" এর রোল সফলভাবে "${
            targetRole === "admin" ? "এডমিন" : targetRole === "teacher" ? "শিক্ষক" : "শিক্ষার্থী"
          }" এ পরিবর্তন করা হয়েছে।`,
        });
        setRoleModalUser(null);
        await loadUsers();
      } else {
        const data = await res.json();
        setStatusMsg({ type: "error", text: data.error || "রোল পরিবর্তন করা যায়নি।" });
      }
    } catch (e) {
      setStatusMsg({ type: "error", text: "সার্ভার এরর।" });
    } finally {
      setRoleUpdating(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;
    setPasswordUpdating(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/users/${resetModalUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (res.ok) {
        setStatusMsg({
          type: "success",
          text: `"${resetModalUser.name}" এর পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।`,
        });
        setResetModalUser(null);
        setNewPassword("");
      } else {
        const data = await res.json();
        setStatusMsg({ type: "error", text: data.error || "পাসওয়ার্ড আপডেট করা যায়নি।" });
      }
    } catch (e) {
      setStatusMsg({ type: "error", text: "সার্ভার এরর।" });
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (u.id === currentUser?.id) {
      setStatusMsg({ type: "error", text: "আপনি নিজের অ্যাকাউন্ট ডিলিট করতে পারবেন না।" });
      return;
    }
    if (!confirm(`আপনি কি নিশ্চিত যে "${u.name}" এর অ্যাকাউন্ট নিষ্ক্রিয় করতে চান?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatusMsg({ type: "success", text: `"${u.name}" এর অ্যাকাউন্ট সফলভাবে সরানো হয়েছে।` });
        await loadUsers();
      } else {
        setStatusMsg({ type: "error", text: data.error || "অ্যাকাউন্ট সরানো যায়নি।" });
      }
    } catch {
      setStatusMsg({ type: "error", text: "সার্ভার এরর।" });
    }
  };

  if (loading || !currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-100 font-bengali">
      {/* Header */}
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
            <FaArrowLeft /> ড্যাশবোর্ড
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <FaUsers className="text-purple-400" /> ব্যবহারকারী ও রোল ব্যবস্থাপনা (Role Management)
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Status Toast */}
        {statusMsg && (
          <div
            role={statusMsg.type === "error" ? "alert" : "status"}
            className={`mb-6 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn ${
              statusMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                : "bg-red-50 border border-red-300 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              {statusMsg.type === "success" ? <FaCheck className="text-emerald-600" /> : <FaTimes className="text-red-600" />}
              {statusMsg.text}
            </div>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="text-xs opacity-60 hover:opacity-100 transition p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase">মোট ব্যবহারকারী</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100 text-center">
            <p className="text-xs font-semibold text-red-500 uppercase flex items-center justify-center gap-1">
              <FaUserShield /> এডমিন
            </p>
            <p className="text-2xl font-black text-red-600 mt-1">{adminCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 text-center">
            <p className="text-xs font-semibold text-green-600 uppercase flex items-center justify-center gap-1">
              <FaChalkboardTeacher /> শিক্ষক
            </p>
            <p className="text-2xl font-black text-green-700 mt-1">{teacherCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 text-center">
            <p className="text-xs font-semibold text-blue-600 uppercase flex items-center justify-center gap-1">
              <FaGraduationCap /> শিক্ষার্থী
            </p>
            <p className="text-2xl font-black text-blue-700 mt-1">{studentCount}</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ইউজারনেম বা ইমেইল দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#051939]"
            />
          </div>

          {/* Role Filters */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: "all", label: "সকল" },
              { id: "admin", label: "এডমিন" },
              { id: "teacher", label: "শিক্ষক" },
              { id: "student", label: "শিক্ষার্থী" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  roleFilter === tab.id
                    ? "bg-[#051939] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">
              ব্যবহারকারী তালিকা ({filteredUsers.length} জন)
            </h2>
            <p className="text-xs text-gray-500">
              💡 আপনি যেকোনো ব্যবহারকারীকে এডমিন রোল প্রদান বা পরিবর্তন করতে পারেন।
            </p>
          </div>

          {fetching ? (
            <div className="text-center py-16 text-gray-400">লোড হচ্ছে...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">কোনো ব্যবহারকারী পাওয়া যায়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#051939] text-white">
                  <tr>
                    <th className="py-3 px-4 text-left">#</th>
                    <th className="py-3 px-4 text-left">নাম ও পরিচয়</th>
                    <th className="py-3 px-4 text-left">ইউজারনেম / ইমেইল</th>
                    <th className="py-3 px-4 text-left">বর্তমান রোল</th>
                    <th className="py-3 px-4 text-center">রোল ব্যবস্থাপনা</th>
                    <th className="py-3 px-4 text-right">অন্যান্য অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u, i) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">{i + 1}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900 flex items-center gap-2">
                            {u.name}
                            {isSelf && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                আপনি
                              </span>
                            )}
                          </p>
                          {u.class && (
                            <span className="text-[11px] text-gray-400">শ্রেণি: {u.class}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {u.username}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              u.role === "admin"
                                ? "bg-red-100 text-red-700"
                                : u.role === "teacher"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {u.role === "admin" ? (
                              <>
                                <FaUserShield /> এডমিন
                              </>
                            ) : u.role === "teacher" ? (
                              <>
                                <FaChalkboardTeacher /> শিক্ষক
                              </>
                            ) : (
                              <>
                                <FaGraduationCap /> শিক্ষার্থী
                              </>
                            )}
                          </span>
                        </td>

                        {/* Role Management Actions */}
                        <td className="py-3 px-4 text-center">
                          {isSelf ? (
                            <span className="text-xs text-gray-400 italic">প্রধান এডমিন</span>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              {/* Quick Make Admin Button */}
                              {u.role !== "admin" ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRoleModalUser(u);
                                    setTargetRole("admin");
                                  }}
                                  className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                                  title="এডমিন রোল প্রদান করুন"
                                >
                                  <FaCrown size={12} /> এডমিন বানান
                                </button>
                              ) : null}

                              {/* Role Selector Dropdown */}
                              <select
                                value={u.role}
                                onChange={(e) => {
                                  const newRole = e.target.value as any;
                                  setRoleModalUser(u);
                                  setTargetRole(newRole);
                                }}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white text-gray-700 focus:ring-1 focus:ring-[#051939] cursor-pointer"
                              >
                                <option value="admin">👑 এডমিন</option>
                                <option value="teacher">👨‍🏫 শিক্ষক</option>
                                <option value="student">🎓 শিক্ষার্থী</option>
                              </select>
                            </div>
                          )}
                        </td>

                        {/* Other Actions: Reset Password & Delete */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setResetModalUser(u);
                                setNewPassword("123456");
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                              title="পাসওয়ার্ড রিসেট করুন"
                            >
                              <FaKey size={14} />
                            </button>
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                                title="অ্যাকাউন্ট সরান"
                              >
                                <FaTrash size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Role Change Confirmation Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-fadeIn">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <FaExclamationTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">রোল পরিবর্তন নিশ্চিতকরণ</h3>
                <p className="text-xs text-gray-500">ব্যবহারকারীর অধিকার হালনাগাদ</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200 text-sm space-y-1.5">
              <p>
                <span className="font-bold text-gray-600">ব্যবহারকারী:</span>{" "}
                <span className="font-bold text-gray-900">{roleModalUser.name}</span>
              </p>
              <p>
                <span className="font-bold text-gray-600">ইউজারনেম:</span>{" "}
                <span className="font-mono text-xs">{roleModalUser.username}</span>
              </p>
              <p>
                <span className="font-bold text-gray-600">নতুন রোল:</span>{" "}
                <span
                  className={`font-bold px-2 py-0.5 rounded text-xs ${
                    targetRole === "admin"
                      ? "bg-red-100 text-red-700"
                      : targetRole === "teacher"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {targetRole === "admin"
                    ? "👑 প্রধান এডমিন (Admin)"
                    : targetRole === "teacher"
                    ? "👨‍🏫 শিক্ষক (Teacher)"
                    : "🎓 শিক্ষার্থী (Student)"}
                </span>
              </p>
            </div>

            {targetRole === "admin" && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mb-4 leading-relaxed font-medium">
                ⚠️ সতর্কবার্তা: এডমিন রোল দিলে এই ব্যবহারকারী বিদ্যালয়ের সকল তথ্য পরিবর্তন, নতুন শিক্ষক-শিক্ষার্থী যোগ, নোটিশ প্রকাশ ও অন্যান্য ব্যবহারকারীর রোল পরিবর্তন করার পূর্ণ অনুমতি পাবেন।
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleRoleChangeConfirm}
                disabled={roleUpdating}
                className="px-5 py-2 bg-[#051939] hover:bg-[#800505] text-white rounded-lg text-sm font-bold shadow-md transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                {roleUpdating ? (
                  <>
                    <FaSpinner className="animate-spin" /> সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  "হ্যাঁ, নিশ্চিত করুন"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-fadeIn">
            <div className="flex items-center gap-3 text-blue-600 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaKey size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">পাসওয়ার্ড রিসেট</h3>
                <p className="text-xs text-gray-500">{resetModalUser.name} এর জন্য নতুন পাসওয়ার্ড সেট করুন</p>
              </div>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  নতুন পাসওয়ার্ড
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড দিন"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>প্রস্তাবিত ডিফল্ট: 123456</span>
                <button
                  type="button"
                  onClick={() => setNewPassword("123456")}
                  className="text-blue-600 hover:underline font-bold"
                >
                  ডিফল্ট 123456 সেট করুন
                </button>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={passwordUpdating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {passwordUpdating ? (
                    <>
                      <FaSpinner className="animate-spin" /> সংরক্ষণ হচ্ছে...
                    </>
                  ) : (
                    "পাসওয়ার্ড সংরক্ষণ করুন"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
