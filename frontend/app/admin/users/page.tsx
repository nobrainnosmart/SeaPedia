"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Search } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import RoleBadge from "@/components/ui/RoleBadge";
import Price from "@/components/ui/Price";

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
        <div className="space-y-6 text-manifest-ink">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-role-admin">Manajemen Sistem</span>
              <h1 className="text-2xl font-bold font-display mt-0.5">Daftar Pengguna</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">
                {loading ? "Memuat..." : `Daftar ${users.length} akun pengguna yang terdaftar.`}
              </p>
            </div>
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari username atau email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-line rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-role-admin/30 focus:border-role-admin transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-sea-foam/50 rounded-lg animate-pulse border border-line" />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-default overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-sea-foam/15 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="px-5 py-3.5 font-medium">Username</th>
                      <th className="px-5 py-3.5 font-medium">Email</th>
                      <th className="px-5 py-3.5 font-medium">Otoritas Peran</th>
                      <th className="px-5 py-3.5 font-medium">Saldo SeaWallet</th>
                      <th className="px-5 py-3.5 font-medium">Tanggal Gabung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-xs text-manifest-ink">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground font-light">
                          <Users className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3 stroke-1" />
                          Tidak ada data pengguna yang cocok.
                        </td>
                      </tr>
                    ) : filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-sea-foam/5 transition-colors">
                        <td className="px-5 py-3.5 font-bold">{u.username}</td>
                        <td className="px-5 py-3.5 font-light text-muted-foreground">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r: string) => (
                              <RoleBadge key={r} role={r as any} />
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Price amount={u.walletBalance} size="sm" className="font-bold text-manifest-ink" />
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground tabular-nums">
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
