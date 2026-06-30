"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, TrendingUp, Calendar, ArrowUpRight, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import Link from "next/link";

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
        <div className="max-w-md mx-auto space-y-6 pb-12 text-manifest-ink">
          {/* Header */}
          <div className="space-y-1.5">
            <Link
              href="/driver/dashboard"
              className="text-xs text-muted-foreground hover:text-manifest-ink transition flex items-center gap-1.5 w-fit p-1 rounded hover:bg-sea-foam/40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold font-display">Buku Pendapatan</h1>
            <p className="text-muted-foreground text-xs font-light">Tinjau pendapatan dari pengantaran paket Anda dan riwayat transaksi.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Informasi Finansial...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pocket Balances */}
              <div className="grid grid-cols-1 gap-4">
                {/* Active pocket */}
                <div className="rounded-default p-5 flex flex-col justify-between h-36 bg-role-driver text-white shadow-card relative overflow-hidden">
                  {/* Large faint Wallet watermark */}
                  <Wallet className="absolute right-[-15px] bottom-[-15px] h-24 w-24 text-white/5 pointer-events-none transform -rotate-12 stroke-1" />
                  
                  <div className="flex justify-between items-start z-10">
                    <span className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">Saldo Aktif Saat Ini</span>
                    <div className="h-7 w-7 bg-white/15 rounded flex items-center justify-center border border-white/10">
                      <Wallet className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  
                  <div className="z-10">
                    <Price amount={data.balance} size="2xl" className="text-white font-bold text-xl md:text-2xl" />
                    <p className="text-[9px] text-white/50 font-light mt-1">Saldo kurir sedia cair kapan saja.</p>
                  </div>
                </div>

                {/* Total collected */}
                <Card className="border border-line bg-white rounded-default p-4 shadow-card flex items-center gap-4">
                  <div className="p-2 bg-role-seller/10 text-role-seller rounded-lg border border-role-seller/15 shrink-0">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Pendapatan Terkumpul</span>
                    <Price amount={data.totalEarnings} size="base" className="font-bold text-manifest-ink mt-0.5" />
                  </div>
                </Card>
              </div>

              {/* Transactions History */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ArrowUpRight className="h-4.5 w-4.5 text-sea-mid shrink-0" />
                  Riwayat Pendapatan Masuk
                </h2>

                {data.transactions.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-line rounded-default shadow-card flex flex-col items-center">
                    <Calendar className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2 stroke-1" />
                    <p className="text-muted-foreground text-xs font-light">Belum ada transaksi terekam.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-line rounded-default overflow-hidden shadow-card">
                    <div className="divide-y divide-line">
                      {data.transactions.map((tx: any) => (
                        <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-sea-foam/5 transition-colors">
                          <div className="min-w-0">
                            <p className="font-bold text-manifest-ink text-xs leading-snug">{tx.description}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-1 tabular-nums flex items-center gap-1">
                              <Calendar className="h-3 w-3 shrink-0" />
                              {new Date(tx.createdAt).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-role-seller">+ <Price amount={tx.amount} className="text-inherit font-bold" /></span>
                            <p className="text-[9px] text-muted-foreground font-mono mt-1 tabular-nums">Ref: #{tx.id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
