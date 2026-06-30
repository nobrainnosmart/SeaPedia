"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Store, Package, ShoppingBag, TrendingUp, Activity, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => toast.error("Gagal memuat statistik platform."))
      .finally(() => setLoading(false));
  }, []);

  const getRoleColorClass = (role: string) => {
    switch (role.toUpperCase()) {
      case "BUYER":
        return "bg-role-buyer";
      case "SELLER":
        return "bg-role-seller";
      case "DRIVER":
        return "bg-role-driver";
      case "ADMIN":
        return "bg-role-admin";
      default:
        return "bg-muted-foreground";
    }
  };

  const kpis = stats ? [
    { label: "Total Pengguna", value: stats.totalUsers, icon: Users, color: "bg-role-admin/10 text-role-admin border-role-admin/15" },
    { label: "Toko Aktif", value: stats.totalStores, icon: Store, color: "bg-role-seller/10 text-role-seller border-role-seller/15" },
    { label: "Produk Aktif", value: stats.totalProducts, icon: Package, color: "bg-role-buyer/10 text-role-buyer border-role-buyer/15" },
    { label: "Total Pesanan", value: stats.totalOrders, icon: ShoppingBag, color: "bg-cargo-amber/10 text-cargo-amber border-cargo-amber/15" },
    { label: "Pesanan Selesai", value: stats.completedOrders, icon: Activity, color: "bg-role-seller/10 text-role-seller border-role-seller/15" },
    { label: "Pesanan Aktif", value: stats.activeOrders, icon: Clock, color: "bg-role-driver/10 text-role-driver border-role-driver/15" },
  ] : [];

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-8 text-manifest-ink">
          {/* Header */}
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-role-admin">Ruang Kontrol</span>
            <h1 className="text-2xl font-bold font-display mt-0.5">Admin Panel</h1>
            <p className="text-muted-foreground text-xs font-light mt-0.5">Metrik performa dan pengawasan operasional SeaPedia.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-sea-foam/50 rounded-default animate-pulse border border-line" />
              ))}
            </div>
          ) : (
            <>
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map(kpi => (
                  <Card key={kpi.label} className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col justify-between h-24">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{kpi.label}</span>
                      <div className={`p-1 rounded border ${kpi.color}`}>
                        <kpi.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <span className="text-base font-bold font-mono tabular-nums">
                      {kpi.value.toLocaleString("id-ID")}
                    </span>
                  </Card>
                ))}
              </div>

              {/* GMV + Role breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GMV Card */}
                <Card className="border border-line bg-white rounded-default p-5 shadow-card flex items-center gap-4">
                  <div className="p-3 bg-role-seller/10 text-role-seller border border-role-seller/15 rounded-lg shrink-0">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Gross Merchandise Value (GMV)</span>
                    <Price amount={stats.gmv || 0} size="2xl" className="font-bold text-sea-deep mt-0.5 block" />
                    <p className="text-[10px] text-muted-foreground font-light mt-1">Total akumulasi pembayaran dari seluruh pesanan sukses.</p>
                  </div>
                </Card>

                {/* Role breakdown with color-coded identity accents */}
                <Card className="border border-line bg-white rounded-default p-5 shadow-card space-y-4">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Distribusi Peran Pengguna</span>
                  <div className="space-y-3">
                    {Object.entries(stats.roleCounts || {}).map(([role, count]) => {
                      const percentage = stats.totalUsers > 0 ? Math.round(((count as number) / stats.totalUsers) * 100) : 0;
                      return (
                        <div key={role} className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-manifest-ink w-16 uppercase">{role}</span>
                          <div className="flex-1 bg-sea-foam rounded-full h-2 overflow-hidden border border-line">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${getRoleColorClass(role)}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-muted-foreground w-10 text-right tabular-nums">
                            {count as number}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Virtual Time in premium dark mode layout */}
              <Card className="border border-line bg-manifest-ink text-white rounded-default p-5 shadow-card flex items-center gap-4 relative overflow-hidden">
                <Clock className="h-6 w-6 text-role-admin shrink-0" />
                <div className="z-10 space-y-0.5">
                  <span className="text-[9px] text-white/50 font-semibold uppercase tracking-wider block">Siklus Waktu Sistem Virtual (Jam Simulasi)</span>
                  <p className="text-sm font-bold text-sea-foam">
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
