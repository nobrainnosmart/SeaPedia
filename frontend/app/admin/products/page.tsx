"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Package, Search, AlertCircle } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/products")
      .then(res => setProducts(res.data))
      .catch(() => toast.error("Gagal memuat data produk."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.store?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-6 text-manifest-ink">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-role-admin">Manajemen Sistem</span>
              <h1 className="text-2xl font-bold font-display mt-0.5">Daftar Produk</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">
                {loading ? "Memuat..." : `Daftar ${products.length} katalog produk aktif di platform.`}
              </p>
            </div>
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari produk atau toko..."
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
                      <th className="px-5 py-3.5 font-medium">Informasi Produk</th>
                      <th className="px-5 py-3.5 font-medium">Toko Asal</th>
                      <th className="px-5 py-3.5 font-medium">Harga Jual</th>
                      <th className="px-5 py-3.5 font-medium">Stok Tersisa</th>
                      <th className="px-5 py-3.5 font-medium">Tanggal Dibuat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-xs text-manifest-ink">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground font-light">
                          <Package className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3 stroke-1" />
                          Tidak ada produk yang cocok.
                        </td>
                      </tr>
                    ) : filtered.map((p) => {
                      const isLowStock = p.stock < 5;
                      return (
                        <tr key={p.id} className="hover:bg-sea-foam/5 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded object-cover border border-line shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-sea-foam/25 border border-line flex items-center justify-center shrink-0">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-bold text-manifest-ink line-clamp-1 leading-tight">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground font-light">{p.store?.name}</td>
                          <td className="px-5 py-3.5">
                            <Price amount={p.price} size="sm" className="font-bold text-manifest-ink" />
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={cn(
                              "inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono tabular-nums",
                              isLowStock 
                                ? "bg-tide-coral/15 text-tide-coral border border-tide-coral/10" 
                                : "bg-role-seller/15 text-role-seller border border-role-seller/10"
                            )}>
                              {isLowStock && <AlertCircle className="h-3 w-3 shrink-0" />}
                              {p.stock} unit
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                            {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      );
                    })}
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
