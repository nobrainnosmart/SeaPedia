"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

const ROLE_COLORS: Record<string, string> = {
  BUYER: "bg-blue-50 text-blue-700 ring-blue-600/20",
  SELLER: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  DRIVER: "bg-amber-50 text-amber-700 ring-amber-600/20",
  ADMIN: "bg-red-50 text-red-700 ring-red-600/20",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/users")
      .then(res => setUsers(res.data))
      .catch(() => toast.error("Gagal memuat data pengguna."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Manajemen Pengguna</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">
                {loading ? "Memuat..." : `${users.length} pengguna terdaftar`}
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari username atau email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-zinc-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Pengguna</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Peran</th>
                      <th className="px-6 py-4">Saldo Dompet</th>
                      <th className="px-6 py-4">Bergabung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-light">
                          <Users className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
                          Tidak ada pengguna yang cocok.
                        </td>
                      </tr>
                    ) : filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-zinc-900">{u.username}</td>
                        <td className="px-6 py-4 text-zinc-500 font-light">{u.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r: string) => (
                              <span key={r} className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${ROLE_COLORS[r] || "bg-zinc-50 text-zinc-700 ring-zinc-200"}`}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-900">
                          Rp {u.walletBalance.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 font-light">
                          {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
