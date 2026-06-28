"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Store, Package, ShoppingBag, TrendingUp, Activity, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => toast.error("Gagal memuat statistik platform."))
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats ? [
    { label: "Total Pengguna", value: stats.totalUsers, icon: Users, color: "bg-indigo-50 text-indigo-600" },
    { label: "Toko Aktif", value: stats.totalStores, icon: Store, color: "bg-blue-50 text-blue-600" },
    { label: "Produk Aktif", value: stats.totalProducts, icon: Package, color: "bg-purple-50 text-purple-600" },
    { label: "Total Pesanan", value: stats.totalOrders, icon: ShoppingBag, color: "bg-amber-50 text-amber-600" },
    { label: "Pesanan Selesai", value: stats.completedOrders, icon: Activity, color: "bg-emerald-50 text-emerald-600" },
    { label: "Pesanan Aktif", value: stats.activeOrders, icon: Clock, color: "bg-orange-50 text-orange-600" },
  ] : [];

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-950">Admin Panel</h1>
            <p className="text-zinc-500 text-sm font-light mt-0.5">Ringkasan performa platform SeaPedia secara keseluruhan.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-zinc-100 rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {kpis.map(kpi => (
                  <Card key={kpi.label} className="border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm space-y-3">
                    <div className={`p-2.5 rounded-xl w-fit ${kpi.color}`}>
                      <kpi.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">{kpi.label}</p>
                      <p className="text-2xl font-extrabold text-zinc-950 mt-0.5">{kpi.value.toLocaleString("id-ID")}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* GMV + Role breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm flex items-center gap-6">
                  <div className="p-4 bg-emerald-50 rounded-2xl shrink-0">
                    <TrendingUp className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Gross Merchandise Value (GMV)</p>
                    <p className="text-3xl font-extrabold text-zinc-950 mt-0.5">
                      Rp {(stats.gmv || 0).toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-zinc-500 font-light mt-1">Akumulasi total dari semua pesanan selesai</p>
                  </div>
                </Card>

                <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm space-y-4">
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Distribusi Peran Pengguna</p>
                  <div className="space-y-2">
                    {Object.entries(stats.roleCounts || {}).map(([role, count]) => (
                      <div key={role} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-zinc-500 w-16">{role}</span>
                        <div className="flex-1 bg-zinc-100 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{ width: `${Math.round(((count as number) / stats.totalUsers) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-zinc-700 w-6 text-right">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Virtual Time */}
              <Card className="border border-zinc-100 bg-zinc-950 text-white rounded-3xl p-6 shadow-sm flex items-center gap-4">
                <Clock className="h-6 w-6 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Waktu Sistem Virtual</p>
                  <p className="text-lg font-bold text-indigo-300 mt-0.5">
                    {new Date(stats.virtualTime).toLocaleString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
