"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart2, TrendingUp, Package, Clock, ArrowUpRight, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import { cn } from "@/lib/utils";

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
            <p className="text-[10px] font-mono font-bold text-role-seller opacity-0 group-hover:opacity-100 transition-opacity duration-300 tabular-nums">
              {pct > 0 ? `Rp ${(d.amount / 1000).toFixed(0)}K` : "-"}
            </p>
            <div className="w-full flex items-end justify-center h-32 relative">
              <div
                className="w-full rounded-t-sm bg-role-seller group-hover:bg-role-seller/80 transition-all duration-500 shadow-sm"
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

export default function SellerReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/seller/reports")
      .then(res => setReport(res.data))
      .catch(() => toast.error("Gagal memuat laporan."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Laporan Penjualan...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-role-seller font-display">Analitik</span>
              <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">Laporan Penjualan</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">Analisis performa, pendapatan, dan efisiensi logistik toko Anda secara menyeluruh.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex items-center gap-3">
                <div className="p-2 bg-role-seller/10 text-role-seller rounded-lg border border-role-seller/15 shrink-0">
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Pendapatan</p>
                  <Price amount={report?.totalRevenue || 0} size="base" className="font-bold text-manifest-ink mt-0.5" />
                </div>
              </Card>

              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex items-center gap-3">
                <div className="p-2 bg-role-buyer/10 text-role-buyer rounded-lg border border-role-buyer/15 shrink-0">
                  <ArrowUpRight className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Pesanan Selesai</p>
                  <p className="text-sm font-bold text-manifest-ink font-mono mt-0.5 tabular-nums">{report?.orderCount || 0} order</p>
                </div>
              </Card>

              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex items-center gap-3">
                <div className="p-2 bg-role-driver/10 text-role-driver rounded-lg border border-role-driver/15 shrink-0">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Pesanan Aktif</p>
                  <p className="text-sm font-bold text-manifest-ink font-mono mt-0.5 tabular-nums">{report?.pendingCount || 0} order</p>
                </div>
              </Card>

              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex items-center gap-3">
                <div className="p-2 bg-role-admin/10 text-role-admin rounded-lg border border-role-admin/15 shrink-0">
                  <Package className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Produk Aktif</p>
                  <p className="text-sm font-bold text-manifest-ink font-mono mt-0.5 tabular-nums">{report?.productCount || 0} unit</p>
                </div>
              </Card>
            </div>

            {/* Monthly Chart */}
            <Card className="border border-line bg-white rounded-default p-5 shadow-card space-y-4">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <BarChart2 className="h-4.5 w-4.5 text-role-seller shrink-0" />
                <h2 className="text-xs font-bold text-manifest-ink font-display uppercase tracking-wider">Tren Pendapatan 6 Bulan Terakhir</h2>
              </div>
              {report?.monthly?.length > 0 ? (
                <MonthlyBarChart data={report.monthly} />
              ) : (
                <p className="text-muted-foreground font-light text-xs py-10 text-center">Belum ada data transaksi terekam.</p>
              )}
            </Card>

            {/* Top Products */}
            {report?.topProducts?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Trophy className="h-4.5 w-4.5 text-cargo-amber shrink-0" />
                  Katalog Produk Terlaris
                </h2>
                <div className="bg-white border border-line rounded-default overflow-hidden shadow-card">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-line bg-sea-foam/15 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="px-5 py-3.5 font-medium w-16">Peringkat</th>
                        <th className="px-5 py-3.5 font-medium">Nama Produk</th>
                        <th className="px-5 py-3.5 font-medium">Terjual</th>
                        <th className="px-5 py-3.5 text-right font-medium">Total Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-xs text-manifest-ink">
                      {report.topProducts.map((p: any, i: number) => {
                        let trophyBg = "bg-sea-foam text-muted-foreground";
                        if (i === 0) trophyBg = "bg-cargo-amber text-white";
                        else if (i === 1) trophyBg = "bg-slate-300 text-slate-700";
                        else if (i === 2) trophyBg = "bg-amber-600 text-white";

                        return (
                          <tr key={p.id} className="hover:bg-sea-foam/5 transition-colors">
                            <td className="px-5 py-3.5">
                              <span className={cn("inline-flex items-center justify-center w-5.5 h-5.5 rounded-full text-[10px] font-bold", trophyBg)}>
                                {i + 1}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-bold">{p.name}</td>
                            <td className="px-5 py-3.5 font-mono tabular-nums">{p.qty} unit</td>
                            <td className="px-5 py-3.5 text-right">
                              <Price amount={p.revenue} size="sm" className="font-bold text-role-seller" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Income Transactions */}
            {report?.recentTransactions?.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ArrowUpRight className="h-4.5 w-4.5 text-sea-mid shrink-0" />
                  Transaksi Dompet Masuk Terbaru
                </h2>
                <div className="bg-white border border-line rounded-default overflow-hidden shadow-card">
                  <div className="divide-y divide-line">
                    {report.recentTransactions.map((tx: any) => (
                      <div key={tx.id} className="px-5 py-4 flex justify-between items-center hover:bg-sea-foam/5 transition-colors">
                        <div className="min-w-0">
                          <p className="font-bold text-manifest-ink text-xs leading-snug">{tx.description}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-1 tabular-nums">
                            {new Date(tx.createdAt).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-role-seller">+ <Price amount={tx.amount} className="text-inherit font-bold" /></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
