"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

export default function DriverEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await api.get("/driver/earnings");
      setData(res.data);
    } catch (err) {
      toast.error("Gagal memuat rincian penghasilan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="DRIVER">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat data penghasilan...</div>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Penghasilan Kurir</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">Tinjau pendapatan dari pengiriman Anda dan riwayat penarikan dana.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm flex items-center space-x-6">
                <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0">
                  <Wallet className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Saldo Dompet Saat Ini</p>
                  <p className="text-3xl font-extrabold text-zinc-950 mt-1">Rp {data.balance.toLocaleString("id-ID")}</p>
                </div>
              </Card>

              <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm flex items-center space-x-6">
                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Pendapatan Terkumpul</p>
                  <p className="text-3xl font-extrabold text-zinc-950 mt-1">Rp {data.totalEarnings.toLocaleString("id-ID")}</p>
                </div>
              </Card>
            </div>

            {/* Transactions History */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-indigo-500" />
                Riwayat Transaksi Masuk (Pendapatan)
              </h2>

              {data.transactions.length === 0 ? (
                <div className="text-center py-16 bg-white border border-zinc-200 rounded-3xl">
                  <Calendar className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                  <p className="text-zinc-400 font-light">Belum ada pendapatan yang masuk.</p>
                </div>
              ) : (
                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-zinc-150">
                    {data.transactions.map((tx: any) => (
                      <div key={tx.id} className="p-6 flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
                        <div className="space-y-1">
                          <p className="font-bold text-zinc-900 leading-snug">{tx.description}</p>
                          <p className="text-xs text-zinc-400 font-light flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(tx.createdAt).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-emerald-600">+Rp {tx.amount.toLocaleString("id-ID")}</p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Ref: #{tx.id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    ))}
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
