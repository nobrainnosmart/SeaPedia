"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart2, ShoppingBag, TrendingUp, Store, Calendar } from "lucide-react";
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
                className="w-full rounded-t-lg bg-indigo-500 transition-all duration-500"
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

export default function BuyerReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/buyer/reports")
      .then(res => setReport(res.data))
      .catch(() => toast.error("Gagal memuat laporan."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowedRole="BUYER">
        <DashboardLayout>
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat laporan pengeluaran...</div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-950">Laporan Pengeluaran</h1>
            <p className="text-zinc-500 text-sm font-light mt-0.5">Analisis riwayat belanja dan pola pengeluaran Anda.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="p-3 bg-indigo-50 rounded-2xl shrink-0">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Belanja</p>
                <p className="text-2xl font-extrabold text-zinc-950 mt-0.5">
                  Rp {(report?.totalSpent || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </Card>

            <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="p-3 bg-blue-50 rounded-2xl shrink-0">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Pesanan Selesai</p>
                <p className="text-2xl font-extrabold text-zinc-950 mt-0.5">{report?.orderCount || 0}</p>
              </div>
            </Card>

            <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="p-3 bg-emerald-50 rounded-2xl shrink-0">
                <Store className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Rata-rata Per Pesanan</p>
                <p className="text-2xl font-extrabold text-zinc-950 mt-0.5">
                  Rp {(report?.avgOrderValue || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </Card>
          </div>

          {/* Monthly Chart */}
          <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-zinc-950">Pengeluaran 6 Bulan Terakhir</h2>
            </div>
            {report?.monthly?.length > 0 ? (
              <MonthlyBarChart data={report.monthly} />
            ) : (
              <p className="text-zinc-400 font-light text-sm py-8 text-center">Belum ada data pengeluaran.</p>
            )}
          </Card>

          {/* Favorite Store */}
          {report?.favoriteStore && (
            <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="p-3 bg-purple-50 rounded-2xl shrink-0">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Toko Favorit</p>
                <p className="text-lg font-extrabold text-zinc-950 mt-0.5">{report.favoriteStore.name}</p>
                <p className="text-xs text-zinc-500 font-light">{report.favoriteStore.count}x transaksi</p>
              </div>
            </Card>
          )}

          {/* Order History Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-zinc-400" />
              Riwayat Pesanan Terakhir
            </h2>
            {report?.recentOrders?.length === 0 ? (
              <div className="text-center py-16 bg-white border border-zinc-200 rounded-3xl">
                <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <p className="text-zinc-400 font-light">Belum ada pesanan yang selesai.</p>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Toko</th>
                        <th className="px-6 py-4">Metode</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Diskon</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                      {report.recentOrders.map((o: any) => (
                        <tr key={o.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4 font-light text-zinc-500">
                            {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-6 py-4 font-medium text-zinc-800">{o.store?.name}</td>
                          <td className="px-6 py-4 text-zinc-600">{o.deliveryMethod}</td>
                          <td className="px-6 py-4 font-bold text-zinc-900">Rp {o.totalAmount.toLocaleString("id-ID")}</td>
                          <td className="px-6 py-4 font-semibold text-green-600">
                            {o.discountAmount > 0 ? `-Rp ${o.discountAmount.toLocaleString("id-ID")}` : "-"}
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
