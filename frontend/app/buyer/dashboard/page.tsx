"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, ShoppingBag, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import Price from "@/components/ui/Price";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function BuyerDashboard() {
  const [report, setReport] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    Promise.all([
      api.get("/buyer/reports").catch(() => null),
      api.get("/buyer/wallet").catch(() => null),
    ]).then(([reportRes, walletRes]) => {
      if (reportRes) setReport(reportRes.data);
      if (walletRes) setWallet(walletRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const activeOrders = report?.recentOrders?.filter((o: any) =>
    ["SEDANG_DIKEMAS", "MENUNGGU_PENGIRIM", "SEDANG_DIKIRIM"].includes(o.status)
  ) ?? [];

  const getTodayDate = () => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sea-mid">Ringkasan Aktivitas</span>
              <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">
                Halo, {user?.username || "Pembeli"}
              </h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">
                Berikut manifest aktivitas belanja Anda hari ini.
              </p>
            </div>
            <div className="font-mono text-xs text-muted-foreground bg-sea-foam px-3 py-1.5 rounded-lg border border-line tabular-nums shrink-0">
              {getTodayDate()}
            </div>
          </div>

          {/* Stat Cards */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-sea-foam/50 rounded-default animate-pulse border border-line" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Wallet */}
              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col justify-between h-24">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Saldo Dompet</span>
                  <div className="p-1 rounded bg-role-buyer/15 text-role-buyer">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <Price amount={wallet?.balance || 0} size="xl" className="font-bold text-manifest-ink" />
              </Card>

              {/* Total Spent */}
              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col justify-between h-24">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Belanja</span>
                  <div className="p-1 rounded bg-role-seller/15 text-role-seller">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <Price amount={report?.totalSpent || 0} size="xl" className="font-bold text-manifest-ink" />
              </Card>

              {/* Total Orders */}
              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col justify-between h-24">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Pesanan</span>
                  <div className="p-1 rounded bg-role-admin/15 text-role-admin">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-base font-bold text-manifest-ink font-mono tabular-nums">
                  {report?.orderCount || 0} pesanan
                </span>
              </Card>

              {/* Active Orders */}
              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col justify-between h-24">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Pesanan Aktif</span>
                  <div className="p-1 rounded bg-role-driver/15 text-role-driver">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-base font-bold text-manifest-ink font-mono tabular-nums">
                  {activeOrders.length} pesanan
                </span>
              </Card>
            </div>
          )}

          {/* Active Orders list or empty state */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground">
              Pesanan Aktif Saat Ini
            </h2>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 bg-sea-foam/50 rounded-lg animate-pulse border border-line" />
                ))}
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-10 bg-white border border-line rounded-default text-xs font-light text-muted-foreground">
                Tidak ada pesanan aktif saat ini. Yuk, jelajahi produk dan mulai belanja!
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((o: any) => (
                  <Link key={o.id} href={`/buyer/orders/${o.id}`}>
                    <div className="border border-line rounded-default p-4 bg-white hover:bg-sea-foam/15 transition-all shadow-card flex items-center justify-between gap-4 cursor-pointer">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-manifest-ink">{o.store?.name || "Toko Mitra"}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono tabular-nums">
                          ID: {o.id.slice(0, 8)}... &bull; {new Date(o.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={o.status} />
                        <Price amount={o.totalAmount} size="base" className="font-bold text-manifest-ink" />
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Help box */}
          <div className="bg-white border border-line rounded-default p-5 shadow-card space-y-2">
            <h4 className="text-xs font-bold text-manifest-ink font-display">Pusat Layanan Pembeli</h4>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Anda dapat mengelola saldo dompet digital Anda, melihat & menambah alamat pengiriman,
              mengatur keranjang belanjaan, melacak status pesanan secara visual menggunakan timeline, atau melihat laporan pengeluaran bulanan melalui sidebar navigasi.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
