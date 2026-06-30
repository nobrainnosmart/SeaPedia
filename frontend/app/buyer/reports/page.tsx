"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart2, ShoppingBag, TrendingUp, Store, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";

function MonthlyBarChart({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="flex items-end gap-3 h-48 px-2 max-w-xl mx-auto pt-6">
      {data.map(d => {
        const pct = Math.round((d.amount / max) * 100);
        const [yr, mo] = d.month.split("-");
        const label = new Date(Number(yr), Number(mo) - 1).toLocaleString("id-ID", { month: "short" });
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
            {/* Tooltip on hover */}
            <p className="text-[10px] font-mono font-bold text-sea-mid opacity-0 group-hover:opacity-100 transition-opacity duration-300 tabular-nums">
              {pct > 0 ? `Rp ${(d.amount / 1000).toFixed(0)}K` : "-"}
            </p>
            <div className="w-full flex items-end justify-center h-32 relative">
              <div
                className="w-full rounded-t-sm bg-sea-mid group-hover:bg-sea-mid/80 transition-all duration-500 shadow-sm"
                style={{ height: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
              />
            </div>
            {/* Axis Label in Mono */}
            <p className="text-[10px] text-manifest-ink/60 font-mono uppercase font-medium mt-1 select-none">{label}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function BuyerReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/buyer/reports")
      .then(res => setReport(res.data))
      .catch(() => toast.error("Gagal memuat laporan."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Laporan Analitik...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sea-mid font-display">Analitik</span>
              <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">Laporan Pengeluaran</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">Analisis riwayat belanja dan pola pengeluaran keuangan Anda.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-line bg-white rounded-default p-5 shadow-card flex items-center gap-4">
                <div className="p-2 bg-role-buyer/10 text-role-buyer rounded-lg border border-role-buyer/15 shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Belanja</p>
                  <Price amount={report?.totalSpent || 0} size="xl" className="font-bold text-manifest-ink mt-0.5" />
                </div>
              </Card>

              <Card className="border border-line bg-white rounded-default p-5 shadow-card flex items-center gap-4">
                <div className="p-2 bg-role-seller/10 text-role-seller rounded-lg border border-role-seller/15 shrink-0">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Selesai</p>
                  <p className="text-base font-bold text-manifest-ink font-mono mt-0.5 tabular-nums">
                    {report?.orderCount || 0} pesanan
                  </p>
                </div>
              </Card>

              <Card className="border border-line bg-white rounded-default p-5 shadow-card flex items-center gap-4">
                <div className="p-2 bg-role-admin/10 text-role-admin rounded-lg border border-role-admin/15 shrink-0">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Rata-rata Order</p>
                  <Price amount={report?.avgOrderValue || 0} size="base" className="font-bold text-manifest-ink mt-0.5" />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Monthly Chart (Left 60%) */}
              <Card className="lg:col-span-2 border border-line bg-white rounded-default p-5 shadow-card">
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <BarChart2 className="h-4.5 w-4.5 text-sea-mid shrink-0" />
                  <h2 className="text-xs font-bold text-manifest-ink font-display uppercase tracking-wider">
                    Tren Pengeluaran 6 Bulan Terakhir
                  </h2>
                </div>
                {report?.monthly?.length > 0 ? (
                  <MonthlyBarChart data={report.monthly} />
                ) : (
                  <p className="text-muted-foreground font-light text-xs py-10 text-center">Belum ada catatan pengeluaran bulanan.</p>
                )}
              </Card>

              {/* Favorite Store (Right 40%) */}
              <div className="lg:col-span-1">
                {report?.favoriteStore ? (
                  <Card className="border border-line bg-white rounded-default p-5 shadow-card flex items-center gap-4 h-full">
                    <div className="p-2 bg-role-driver/10 text-role-driver rounded-lg border border-role-driver/15 shrink-0">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Toko Favorit</p>
                      <h4 className="text-sm font-bold text-manifest-ink font-display mt-0.5">{report.favoriteStore.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5 tabular-nums">
                        {report.favoriteStore.count}x transaksi belanja
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Card className="border border-line bg-white rounded-default p-5 shadow-card flex items-center justify-center text-center h-28">
                    <p className="text-xs text-muted-foreground font-light">Belum ada toko favorit terekam.</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Order History Table */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Riwayat Pembelanjaan Terakhir
              </h2>
              {report?.recentOrders?.length === 0 ? (
                <div className="text-center py-16 bg-white border border-line rounded-default text-xs font-light text-muted-foreground">
                  Belum ada pesanan terdaftar.
                </div>
              ) : (
                <div className="bg-white border border-line rounded-default overflow-hidden shadow-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-line bg-sea-foam/15 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="px-5 py-3.5 font-medium">Tanggal</th>
                          <th className="px-5 py-3.5 font-medium">Toko</th>
                          <th className="px-5 py-3.5 font-medium">Metode Kirim</th>
                          <th className="px-5 py-3.5 font-medium text-right">Potongan Diskon</th>
                          <th className="px-5 py-3.5 text-right font-medium">Total Bayar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-xs text-manifest-ink">
                        {report.recentOrders.map((o: any) => (
                          <tr key={o.id} className="hover:bg-sea-foam/5 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-muted-foreground text-[11px] tabular-nums">
                              {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-5 py-3.5 font-bold">{o.store?.name}</td>
                            <td className="px-5 py-3.5 text-muted-foreground font-light">{o.deliveryMethod}</td>
                            <td className="px-5 py-3.5 text-right font-semibold text-role-seller font-mono tabular-nums">
                              {o.discountAmount > 0 ? (
                                <span>- <Price amount={o.discountAmount} size="sm" className="text-inherit font-bold" /></span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Price amount={o.totalAmount} size="base" className="font-bold" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
