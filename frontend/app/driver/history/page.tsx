"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Store, CheckCircle2, Navigation, ArrowLeft, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DriverHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/driver/history");
      setOrders(res.data);
    } catch (err) {
      toast.error("Gagal memuat riwayat pengiriman.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteJob = async (orderId: string) => {
    setCompletingId(orderId);
    try {
      await api.post(`/driver/jobs/${orderId}/complete`);
      toast.success("Pengiriman telah diselesaikan!");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menyelesaikan pengiriman.");
    } finally {
      setCompletingId(null);
    }
  };

  const activeOrders = orders.filter((o) => o.status === "SEDANG_DIKIRIM");
  const completedOrders = orders.filter((o) => o.status === "PESANAN_SELESAI" || o.status === "DIKEMBALIKAN");

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
            <h1 className="text-xl font-bold font-display">Pekerjaan Pengiriman</h1>
            <p className="text-muted-foreground text-xs font-light">Kelola penugasan aktif dan lihat laporan riwayat antaran selesai Anda.</p>
          </div>

          {/* Toggle Tab */}
          <div className="flex border-b border-line gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("active")}
              className={cn(
                "text-xs font-semibold px-4 py-2.5 transition-all border-b-2 whitespace-nowrap outline-none cursor-pointer",
                activeTab === "active"
                  ? "border-cargo-amber text-cargo-amber"
                  : "border-transparent text-muted-foreground hover:text-manifest-ink"
              )}
            >
              Aktif ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={cn(
                "text-xs font-semibold px-4 py-2.5 transition-all border-b-2 whitespace-nowrap outline-none cursor-pointer",
                activeTab === "completed"
                  ? "border-cargo-amber text-cargo-amber"
                  : "border-transparent text-muted-foreground hover:text-manifest-ink"
              )}
            >
              Selesai ({completedOrders.length})
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Tugas...</span>
            </div>
          ) : activeTab === "active" ? (
            <div className="space-y-4">
              {activeOrders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-line rounded-default shadow-card flex flex-col items-center">
                  <div className="p-4 rounded-full bg-sea-foam text-sea-mid mb-4 border border-line">
                    <Navigation className="h-8 w-8 stroke-1" />
                  </div>
                  <h2 className="text-base font-bold font-display">Tidak Ada Tugas Aktif</h2>
                  <p className="text-muted-foreground text-xs font-light mt-1 max-w-[200px] leading-relaxed">
                    Ambil rute pekerjaan baru di halaman Cari Pekerjaan.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <Card key={order.id} className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col justify-between space-y-4">
                      {/* Job Header */}
                      <div className="flex justify-between items-start border-b border-line pb-2.5">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-mono">ID: #{order.id.slice(-8).toUpperCase()}</p>
                          <span className="inline-flex items-center rounded bg-sea-foam px-2 py-0.5 text-[9px] font-bold text-sea-mid border border-line mt-1 uppercase">
                            Dalam Pengiriman
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Ongkir Payout</p>
                          <Price amount={order.deliveryFee} size="base" className="font-bold text-role-seller" />
                        </div>
                      </div>

                      {/* Store */}
                      <div className="flex gap-2.5 items-start">
                        <Store className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                        <div className="min-w-0 text-xs">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ambil Dari Toko</p>
                          <p className="font-bold text-manifest-ink mt-0.5 truncate">{order.store?.name}</p>
                        </div>
                      </div>

                      {/* Destination */}
                      <div className="flex gap-2.5 items-start">
                        <MapPin className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                        <div className="min-w-0 text-xs">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Kirim Ke</p>
                          <p className="font-bold text-manifest-ink mt-0.5">{order.deliveryAddress?.recipientName}</p>
                          <p className="text-muted-foreground mt-1 font-mono tracking-wide font-light flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.deliveryAddress?.phone}
                          </p>
                          <p className="text-muted-foreground mt-1 leading-normal font-light">
                            {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.city}, {order.deliveryAddress?.province}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleCompleteJob(order.id)}
                        disabled={completingId !== null}
                        className="w-full bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg py-5 text-xs font-bold border-0 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {completingId === order.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Menyelesaikan...</span>
                          </>
                        ) : (
                          <span>Selesaikan Pengantaran (Diterima)</span>
                        )}
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {completedOrders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-line rounded-default shadow-card flex flex-col items-center">
                  <div className="p-4 rounded-full bg-sea-foam text-sea-mid mb-4 border border-line">
                    <CheckCircle2 className="h-8 w-8 stroke-1" />
                  </div>
                  <h2 className="text-base font-bold font-display">Belum Ada Riwayat</h2>
                  <p className="text-muted-foreground text-xs font-light mt-1 text-center">
                    Anda belum menyelesaikan tugas pengantaran kargo apa pun.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedOrders.map((o) => (
                    <Card key={o.id} className="border border-line bg-white rounded-default p-3.5 shadow-card space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] text-muted-foreground">ID: #{o.id.slice(-8).toUpperCase()}</span>
                        <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
                          {new Date(o.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="text-xs space-y-1 font-light text-muted-foreground leading-relaxed">
                        <p className="text-manifest-ink font-semibold">Toko: {o.store?.name}</p>
                        <p>Penerima: {o.deliveryAddress?.recipientName}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-line pt-2.5 mt-2">
                        <StatusBadge status={o.status} />
                        <div className="text-right">
                          <Price amount={o.deliveryFee} size="sm" className="font-bold text-role-seller" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
