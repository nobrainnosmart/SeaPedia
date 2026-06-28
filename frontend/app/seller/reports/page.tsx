"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart2, TrendingUp, Package, Clock, ArrowUpRight, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

function MonthlyBarChart({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="flex items-end gap-2 h-40 px-2">
      {data.map(d => {
        const pct = Math.round((d.amount / max) * 100);
        const [yr, mo] = d.month.split("-");
        const label = new Date(Number(yr), Number(mo) - 1).toLocaleString("id-ID", { month: "short" });
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 group">
            <p className="text-[10px] font-bold text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {pct > 0 ? `Rp ${(d.amount / 1000).toFixed(0)}K` : "-"}
            </p>
            <div className="w-full flex items-end justify-center h-32">
              <div
                className="w-full rounded-t-lg bg-emerald-500 transition-all duration-500"
                style={{ height: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 font-semibold">{label}</p>
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

  if (loading) {
    return (
      <ProtectedRoute allowedRole="SELLER">
        <DashboardLayout>
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat laporan penjualan...</div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-950">Laporan Penjualan</h1>
            <p className="text-zinc-500 text-sm font-light mt-0.5">Analisis performa dan pendapatan toko Anda secara menyeluruh.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl w-fit">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Pendapatan</p>
                <p className="text-lg font-extrabold text-zinc-950 mt-0.5">
                  Rp {(report?.totalRevenue || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </Card>

            <Card className="border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="p-2.5 bg-blue-50 rounded-xl w-fit">
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Pesanan Selesai</p>
                <p className="text-lg font-extrabold text-zinc-950 mt-0.5">{report?.orderCount || 0}</p>
              </div>
            </Card>

            <Card className="border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="p-2.5 bg-amber-50 rounded-xl w-fit">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Pesanan Aktif</p>
                <p className="text-lg font-extrabold text-zinc-950 mt-0.5">{report?.pendingCount || 0}</p>
              </div>
            </Card>

            <Card className="border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="p-2.5 bg-purple-50 rounded-xl w-fit">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Produk Aktif</p>
                <p className="text-lg font-extrabold text-zinc-950 mt-0.5">{report?.productCount || 0}</p>
              </div>
            </Card>
          </div>

          {/* Monthly Chart */}
          <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-zinc-950">Pendapatan 6 Bulan Terakhir</h2>
            </div>
            {report?.monthly?.length > 0 ? (
              <MonthlyBarChart data={report.monthly} />
            ) : (
              <p className="text-zinc-400 font-light text-sm py-8 text-center">Belum ada data pendapatan.</p>
            )}
          </Card>

          {/* Top Products */}
          {report?.topProducts?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Produk Terlaris
              </h2>
              <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Nama Produk</th>
                      <th className="px-6 py-4">Terjual (Unit)</th>
                      <th className="px-6 py-4">Total Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                    {report.topProducts.map((p: any, i: number) => (
                      <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-zinc-300 text-zinc-700" : i === 2 ? "bg-orange-300 text-white" : "bg-zinc-100 text-zinc-500"
                          }`}>{i + 1}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-zinc-900">{p.name}</td>
                        <td className="px-6 py-4">{p.qty} unit</td>
                        <td className="px-6 py-4 font-bold text-emerald-600">Rp {p.revenue.toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Income Transactions */}
          {report?.recentTransactions?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-indigo-500" />
                Transaksi Masuk Terbaru
              </h2>
              <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-zinc-100">
                  {report.recentTransactions.map((tx: any) => (
                    <div key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
                      <div>
                        <p className="font-semibold text-zinc-900 text-sm">{tx.description}</p>
                        <p className="text-xs text-zinc-400 font-light mt-0.5">
                          {new Date(tx.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-extrabold text-emerald-600">+Rp {tx.amount.toLocaleString("id-ID")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
