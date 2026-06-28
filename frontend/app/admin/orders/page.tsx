"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Search, User, Store, Truck } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  SEDANG_DIKEMAS: "bg-amber-50 text-amber-700 ring-amber-600/20",
  MENUNGGU_PENGIRIM: "bg-purple-50 text-purple-700 ring-purple-600/20",
  SEDANG_DIKIRIM: "bg-blue-50 text-blue-700 ring-blue-600/20",
  PESANAN_SELESAI: "bg-green-50 text-green-700 ring-green-600/20",
  DIKEMBALIKAN: "bg-red-50 text-red-700 ring-red-600/20",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    api.get("/admin/orders")
      .then(res => setOrders(res.data))
      .catch(() => toast.error("Gagal memuat data pesanan."))
      .finally(() => setLoading(false));
  }, []);

  const allStatuses = ["ALL", "SEDANG_DIKEMAS", "MENUNGGU_PENGIRIM", "SEDANG_DIKIRIM", "PESANAN_SELESAI", "DIKEMBALIKAN"];

  const filtered = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer?.username?.toLowerCase().includes(search.toLowerCase()) ||
      o.store?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Semua Transaksi</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">
                {loading ? "Memuat..." : `${orders.length} pesanan di platform`}
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari ID, pembeli, atau toko..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {allStatuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? "bg-zinc-950 text-white"
                    : "bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {s === "ALL" ? "Semua Status" : s.replace(/_/g, " ")}
              </button>
            ))}
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
                      <th className="px-6 py-4">ID Pesanan</th>
                      <th className="px-6 py-4">Pembeli / Toko</th>
                      <th className="px-6 py-4">Penjual / Kurir</th>
                      <th className="px-6 py-4">Metode</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 font-light">
                          <ShoppingBag className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
                          Tidak ada pesanan yang cocok.
                        </td>
                      </tr>
                    ) : filtered.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-zinc-900">#{o.id.slice(-8).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-zinc-800 flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-zinc-400" />{o.buyer?.username}
                            </p>
                            <p className="text-xs text-zinc-400 flex items-center gap-1 font-light">
                              <Store className="h-3.5 w-3.5 text-zinc-300" />{o.store?.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="font-medium text-zinc-700 flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-zinc-400" />{o.seller?.username}
                            </p>
                            {o.driver && (
                              <p className="text-xs text-indigo-600 flex items-center gap-1 font-medium">
                                <Truck className="h-3.5 w-3.5 text-indigo-400" />{o.driver.username}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-600">{o.deliveryMethod}</td>
                        <td className="px-6 py-4 font-bold text-zinc-900">Rp {o.totalAmount.toLocaleString("id-ID")}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_COLORS[o.status] || ""}`}>
                            {o.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400 font-light">
                          {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
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
