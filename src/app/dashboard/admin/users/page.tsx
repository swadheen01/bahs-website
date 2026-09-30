"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUsers, FaArrowLeft, FaUserShield, FaChalkboardTeacher, FaGraduationCap } from "react-icons/fa";

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.replace("/login");
  }, [user, loading, router]);

  const loadUsers = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error(e);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadUsers();
  }, [user]);

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
            <FaUsers className="text-purple-400" /> ব্যবহারকারী একাউন্টসমূহ
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">নিবন্ধিত সকল ব্যবহারকারী ({users.length} জন)</h2>
          </div>

          {fetching ? (
            <div className="text-center py-10 text-gray-400">লোড হচ্ছে...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-gray-400">কোনো ইউজার পাওয়া যায়নি।</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#051939] text-white">
                <tr>
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">নাম</th>
                  <th className="py-3 px-4 text-left">ইউজারনেম</th>
                  <th className="py-3 px-4 text-left">রোল (Role)</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{u.username}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                        u.role === 'teacher' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role === 'admin' ? <><FaUserShield /> এডমিন</> :
                         u.role === 'teacher' ? <><FaChalkboardTeacher /> শিক্ষক</> : <><FaGraduationCap /> শিক্ষার্থী</>}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold">সক্রিয়</span>
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

