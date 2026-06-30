"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Store, Search, Package, ShoppingBag } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";

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
        <div className="space-y-6 text-manifest-ink">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-role-admin">Manajemen Sistem</span>
              <h1 className="text-2xl font-bold font-display mt-0.5">Daftar Toko</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">
                {loading ? "Memuat..." : `Daftar ${stores.length} toko terdaftar di platform.`}
              </p>
            </div>
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nama toko atau penjual..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-line rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-role-admin/30 focus:border-role-admin transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-sea-foam/50 rounded-lg animate-pulse border border-line" />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-default overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-sea-foam/15 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="px-5 py-3.5 font-medium">Nama Toko</th>
                      <th className="px-5 py-3.5 font-medium">Pemilik / Penjual</th>
                      <th className="px-5 py-3.5 font-medium">Produk Jual</th>
                      <th className="px-5 py-3.5 font-medium">Total Pesanan</th>
                      <th className="px-5 py-3.5 font-medium">Total Omset</th>
                      <th className="px-5 py-3.5 font-medium">Tanggal Dibuat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-xs text-manifest-ink">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground font-light">
                          <Store className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3 stroke-1" />
                          Tidak ada toko yang cocok.
                        </td>
                      </tr>
                    ) : filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-sea-foam/5 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-role-seller/10 border border-role-seller/15 flex items-center justify-center shrink-0">
                              <Store className="h-4 w-4 text-role-seller" />
                            </div>
                            <div>
                              <p className="font-bold text-manifest-ink leading-none">{s.name}</p>
                              <p className="text-[10px] text-muted-foreground font-light mt-1 truncate max-w-[180px]">{s.description || "Tidak ada deskripsi."}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-muted-foreground">{s.sellerUsername}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 font-semibold font-mono tabular-nums">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            {s.productCount} unit
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 font-semibold font-mono tabular-nums">
                            <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                            {s.orderCount} pesanan
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Price amount={s.totalRevenue} size="sm" className="font-bold text-role-seller" />
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground tabular-nums">
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
