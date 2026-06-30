"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, Truck, Navigation, CheckCircle2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import { cn } from "@/lib/utils";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

export default function DriverDashboard() {
  const [earnings, setEarnings] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/driver/earnings").catch(() => null),
      api.get("/driver/history").catch(() => null),
    ]).then(([earningsRes, ordersRes]) => {
      if (earningsRes) setEarnings(earningsRes.data);
      if (ordersRes) setOrders(ordersRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter((o) => o.status === "SEDANG_DIKIRIM");
  const completedOrdersCount = orders.filter((o) => o.status === "PESANAN_SELESAI" || o.status === "DIKEMBALIKAN").length;

  return (
    <ProtectedRoute allowedRole="DRIVER">
      <DashboardLayout>
        <div className="max-w-md mx-auto space-y-6 pb-12">
          {/* Header */}
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-role-driver">Operasional Kurir</span>
            <h1 className="text-xl font-bold text-manifest-ink font-display mt-0.5">Dashboard Pengemudi</h1>
            <p className="text-muted-foreground text-xs font-light mt-0.5">Kelola logistik pengantaran barang jualan Anda hari ini.</p>
          </div>

          {/* Quick Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-sea-foam/50 rounded-default animate-pulse border border-line" />
              <div className="h-20 bg-sea-foam/50 rounded-default animate-pulse border border-line" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* E-wallet pocket balance */}
              <Card className="border border-line bg-white rounded-default p-3.5 shadow-card flex flex-col justify-between h-20">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Dompet Kurir</span>
                <Price amount={earnings?.balance || 0} size="base" className="font-bold text-manifest-ink" />
              </Card>

              {/* Complete Jobs Counter */}
              <Card className="border border-line bg-white rounded-default p-3.5 shadow-card flex flex-col justify-between h-20">
                <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Antaran Selesai</span>
                <span className="text-sm font-bold text-manifest-ink font-mono tabular-nums">{completedOrdersCount} rit</span>
              </Card>
            </div>
          )}

          {/* Active Deliveries Alert Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground">
              Pekerjaan Aktif Saat Ini
            </h2>

            {loading ? (
              <div className="h-28 bg-sea-foam/50 rounded-default animate-pulse border border-line" />
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-8 bg-white border border-line rounded-default text-xs font-light text-muted-foreground shadow-card">
                Tidak ada pengantaran aktif. Cari pekerjaan baru!
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <Card key={order.id} className="border border-role-driver/30 bg-role-driver/5 rounded-default p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[10px] text-muted-foreground">ID: #{order.id.slice(-8).toUpperCase()}</span>
                        <div className="mt-1">
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                      <Price amount={order.deliveryFee} size="base" className="font-bold text-role-driver" />
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1.5 font-light leading-relaxed">
                      <p className="text-manifest-ink font-semibold">Toko: {order.store?.name}</p>
                      <p>Kirim Ke: <strong>{order.deliveryAddress?.recipientName}</strong></p>
                      <p className="truncate">{order.deliveryAddress?.addressLine}</p>
                    </div>

                    <Link 
                      href="/driver/history"
                      className="w-full bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg py-2 flex items-center justify-center gap-1.5 text-xs font-bold border-0 shadow-sm transition-transform hover:scale-[1.01]"
                    >
                      <span>Kelola & Selesaikan</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <Card className="border border-line bg-white rounded-default p-4 shadow-card space-y-3">
            <h3 className="text-xs font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground">Navigasi Tugas</h3>
            <div className="flex flex-col gap-2">
              <Link 
                href="/driver/jobs"
                className="w-full bg-sea-deep hover:bg-sea-deep/90 text-white rounded-lg py-2.5 text-xs font-bold border-0 shadow-sm text-center"
              >
                Cari Pekerjaan Baru (Job Board)
              </Link>
              <Link 
                href="/driver/history"
                className="w-full bg-transparent hover:bg-sea-foam text-manifest-ink rounded-lg py-2.5 text-xs font-semibold border border-line text-center"
              >
                Lihat Semua Riwayat Kerja
              </Link>
              <Link 
                href="/driver/earnings"
                className="w-full bg-transparent hover:bg-sea-foam text-manifest-ink rounded-lg py-2.5 text-xs font-semibold border border-line text-center"
              >
                Buku Pendapatan & Saldo
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
