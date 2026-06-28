"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Store, Search, TrendingUp, Package, ShoppingBag } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/stores")
      .then(res => setStores(res.data))
      .catch(() => toast.error("Gagal memuat data toko."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.sellerUsername.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Manajemen Toko</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">
                {loading ? "Memuat..." : `${stores.length} toko terdaftar di platform`}
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama toko atau penjual..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-zinc-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Nama Toko</th>
                      <th className="px-6 py-4">Penjual</th>
                      <th className="px-6 py-4">Produk</th>
                      <th className="px-6 py-4">Pesanan</th>
                      <th className="px-6 py-4">Total Pendapatan</th>
                      <th className="px-6 py-4">Bergabung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 font-light">
                          <Store className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
                          Tidak ada toko yang cocok.
                        </td>
                      </tr>
                    ) : filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                              <Store className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900">{s.name}</p>
                              <p className="text-xs text-zinc-400 font-light truncate max-w-[160px]">{s.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 font-medium">{s.sellerUsername}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-zinc-700">
                            <Package className="h-3.5 w-3.5 text-zinc-400" />
                            {s.productCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-zinc-700">
                            <ShoppingBag className="h-3.5 w-3.5 text-zinc-400" />
                            {s.orderCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          Rp {s.totalRevenue.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 font-light">
                          {new Date(s.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
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
