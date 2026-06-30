"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Search, User, Store, Truck } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

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
        <div className="space-y-6 text-manifest-ink">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-role-admin">Manajemen Sistem</span>
              <h1 className="text-2xl font-bold font-display mt-0.5">Semua Transaksi</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">
                {loading ? "Memuat..." : `Total ${orders.length} transaksi pesanan tercatat di platform.`}
              </p>
            </div>
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari ID, pembeli, atau toko..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-line rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-role-admin/30 focus:border-role-admin transition"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 pb-2">
            {allStatuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1 rounded text-[10px] font-bold uppercase transition-all border outline-none cursor-pointer",
                  statusFilter === s
                    ? "bg-role-admin text-white border-role-admin"
                    : "bg-white border-line text-muted-foreground hover:text-manifest-ink hover:bg-sea-foam/50"
                )}
              >
                {s === "ALL" ? "Semua Status" : s.replace(/_/g, " ")}
              </button>
            ))}
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
                      <th className="px-5 py-3.5 font-medium">ID Pesanan</th>
                      <th className="px-5 py-3.5 font-medium">Mitra Toko & Pembeli</th>
                      <th className="px-5 py-3.5 font-medium">Penjual & Kurir</th>
                      <th className="px-5 py-3.5 font-medium">Metode</th>
                      <th className="px-5 py-3.5 font-medium">Total Pembayaran</th>
                      <th className="px-5 py-3.5 font-medium">Status Rute</th>
                      <th className="px-5 py-3.5 font-medium">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-xs text-manifest-ink">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground font-light">
                          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3 stroke-1" />
                          Tidak ada data pesanan yang cocok.
                        </td>
                      </tr>
                    ) : filtered.map((o) => (
                      <tr key={o.id} className="hover:bg-sea-foam/5 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-manifest-ink">#{o.id.slice(-8).toUpperCase()}</td>
                        <td className="px-5 py-3.5">
                          <div className="space-y-1">
                            <p className="font-bold flex items-center gap-1">
                              <Store className="h-3.5 w-3.5 text-muted-foreground" />
                              {o.store?.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-light">
                              <User className="h-3.5 w-3.5 text-muted-foreground/50" />
                              Pembeli: {o.buyer?.username}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="space-y-1">
                            <p className="font-semibold text-muted-foreground flex items-center gap-1">
                              Penjual: {o.seller?.username}
                            </p>
                            {o.driver && (
                              <p className="text-[10px] text-sea-mid flex items-center gap-1 font-bold">
                                <Truck className="h-3.5 w-3.5 text-sea-mid" />
                                Kurir: {o.driver.username}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-light text-muted-foreground">{o.deliveryMethod}</td>
                        <td className="px-5 py-3.5">
                          <Price amount={o.totalAmount} size="sm" className="font-bold text-manifest-ink" />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground tabular-nums">
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
