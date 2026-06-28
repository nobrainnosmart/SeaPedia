"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Package, Search, AlertTriangle } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

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

  const getStockBadge = (stock: number) => {
    if (stock === 0) return "bg-red-50 text-red-700 ring-red-600/20";
    if (stock <= 5) return "bg-amber-50 text-amber-700 ring-amber-600/20";
    return "bg-green-50 text-green-700 ring-green-600/20";
  };

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Manajemen Produk</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">
                {loading ? "Memuat..." : `${products.length} produk aktif di platform`}
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari produk atau toko..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-zinc-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Produk</th>
                      <th className="px-6 py-4">Toko</th>
                      <th className="px-6 py-4">Harga</th>
                      <th className="px-6 py-4">Stok</th>
                      <th className="px-6 py-4">Ditambahkan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-light">
                          <Package className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
                          Tidak ada produk yang cocok.
                        </td>
                      </tr>
                    ) : filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-200 shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                                <Package className="h-4 w-4 text-zinc-400" />
                              </div>
                            )}
                            <p className="font-semibold text-zinc-900 line-clamp-1">{p.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 font-light">{p.store?.name}</td>
                        <td className="px-6 py-4 font-bold text-zinc-900">Rp {p.price.toLocaleString("id-ID")}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStockBadge(p.stock)}`}>
                            {p.stock <= 5 && p.stock > 0 && <AlertTriangle className="h-3 w-3" />}
                            {p.stock} unit
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400 font-light">
                          {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
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
