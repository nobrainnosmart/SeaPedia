"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Clock, MapPin, Truck, ShieldCheck, Copy, Check, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Price from "@/components/ui/Price";
import StatusBadge from "@/components/ui/StatusBadge";
import RouteTimeline from "@/components/order/RouteTimeline";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuyerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [virtualTime, setVirtualTime] = useState<Date | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
    fetchSystemTime();
  }, [params.id]);

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/buyer/orders/${params.id}`);
      setOrder(res.data);
    } catch (err) {
      toast.error("Gagal memuat detail pesanan.");
      router.push("/buyer/orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemTime = async () => {
    try {
      const res = await api.get("/health");
      setVirtualTime(new Date(res.data.timestamp));
    } catch (err) {
      setVirtualTime(new Date());
    }
  };

  const handleCancelOverdue = async () => {
    setCancelling(true);
    try {
      await api.post(`/buyer/orders/${params.id}/cancel-overdue`);
      toast.success("Pesanan berhasil dibatalkan karena keterlambatan!");
      fetchOrderDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal membatalkan pesanan.");
    } finally {
      setCancelling(false);
    }
  };

  const isOverdue = () => {
    if (!order || !virtualTime) return false;
    const activeStatuses = ["SEDANG_DIKEMAS", "MENUNGGU_PENGIRIM", "SEDANG_DIKIRIM"];
    if (!activeStatuses.includes(order.status)) return false;

    const createdAt = new Date(order.createdAt);
    const elapsedMs = virtualTime.getTime() - createdAt.getTime();
    
    let limitMs = 0;
    if (order.deliveryMethod === "INSTANT") {
      limitMs = 2 * 60 * 60 * 1000;
    } else if (order.deliveryMethod === "NEXT_DAY") {
      limitMs = 24 * 60 * 60 * 1000;
    } else {
      limitMs = 72 * 60 * 60 * 1000;
    }

    return elapsedMs > limitMs;
  };

  const handleCopyId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    toast.success("ID Pesanan disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-9 w-32 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-default" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full rounded-default" />
            </div>
            <Skeleton className="h-48 w-full rounded-default" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Back button */}
          <Link
            href="/buyer/orders"
            className="text-xs text-muted-foreground hover:text-manifest-ink transition flex items-center gap-1.5 w-fit p-1 rounded hover:bg-sea-foam/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Transaksi</span>
          </Link>

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4 gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground bg-sea-foam px-2 py-0.5 rounded border border-line flex items-center gap-1.5 select-all">
                  #{order.id.slice(0, 8).toUpperCase()}...
                  <button onClick={handleCopyId} className="text-muted-foreground hover:text-sea-mid p-0.5 rounded transition">
                    {copied ? <Check className="h-3.5 w-3.5 text-role-seller" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-[10px] text-muted-foreground font-light">
                Dibuat pada: <span className="font-mono tabular-nums">{new Date(order.createdAt).toLocaleString("id-ID")}</span>
              </p>
            </div>
          </div>

          {/* RouteTimeline front and center, full width */}
          <RouteTimeline 
            statusHistory={order.statusHistory} 
            currentStatus={order.status} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Items & Delivery Details (Left 60%) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Items Card */}
              <Card className="border border-line bg-white rounded-default p-5 shadow-card">
                <h3 className="text-xs font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground pb-2 border-b border-line mb-3">
                  Barang Belanjaan
                </h3>
                <div className="divide-y divide-line">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <h4 className="text-xs font-bold text-manifest-ink leading-snug">{item.productName}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono tabular-nums">
                          {item.quantity} x <Price amount={item.price} size="sm" className="text-inherit font-normal" />
                        </p>
                      </div>
                      <Price amount={item.price * item.quantity} size="base" className="font-bold text-manifest-ink" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Delivery info */}
              <Card className="border border-line bg-white rounded-default p-5 shadow-card grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Destination */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-sea-mid shrink-0" />
                    Alamat Tujuan
                  </h3>
                  <div className="text-xs text-muted-foreground font-light leading-relaxed">
                    <p className="font-bold text-manifest-ink">{order.deliveryAddress?.recipientName}</p>
                    <p className="font-mono mt-0.5 tracking-wide">{order.deliveryAddress?.phone}</p>
                    <p className="mt-1">{order.deliveryAddress?.addressLine}</p>
                    <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.province} {order.deliveryAddress?.postalCode}</p>
                  </div>
                </div>

                {/* Delivery details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-sea-mid shrink-0" />
                    Detail Pengiriman
                  </h3>
                  <div className="text-xs text-muted-foreground font-light leading-relaxed">
                    <p className="font-bold text-manifest-ink">{order.deliveryMethod} Service</p>
                    <p className="mt-1">Biaya Ongkir: <Price amount={order.deliveryFee} className="font-semibold text-manifest-ink text-xs" /></p>
                    
                    {order.driver ? (
                      <div className="mt-3 p-2 bg-sea-foam/15 border border-line rounded flex flex-col gap-1">
                        <span className="font-semibold text-manifest-ink">Driver Ditugaskan:</span>
                        <span className="font-mono text-sea-mid text-[11px] font-bold">{order.driver.username}</span>
                        {order.status === "SEDANG_DIKIRIM" && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-cargo-amber font-semibold mt-1">
                            <Truck className="h-3.5 w-3.5 shrink-0 animate-bounce" />
                            Driver sedang dalam perjalanan
                          </span>
                        )}
                      </div>
                    ) : (
                      order.status !== "SEDANG_DIKEMAS" && order.status !== "DIKEMBALIKAN" && (
                        <p className="mt-2 text-muted-foreground italic font-light">Sedang mencari driver kargo...</p>
                      )
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Pricing Breakdown & Cancel Overdue Actions (Right 40%) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Payment Details Card */}
              <Card className="border border-line bg-white rounded-default p-5 shadow-card space-y-4">
                <h3 className="text-xs font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground pb-2 border-b border-line">
                  Rincian Pembayaran
                </h3>
                
                <div className="space-y-2.5 text-xs text-muted-foreground font-light border-b border-line pb-4">
                  <div className="flex justify-between">
                    <span>Subtotal Belanja</span>
                    <Price amount={order.subtotal} size="sm" className="font-bold text-manifest-ink" />
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-role-seller font-semibold">
                      <span>Potongan Diskon</span>
                      <span>- <Price amount={order.discountAmount} size="sm" className="text-inherit font-bold" /></span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <Price amount={order.deliveryFee} size="sm" className="font-bold text-manifest-ink" />
                  </div>
                  <div className="flex justify-between">
                    <span>PPN (12% Flat)</span>
                    <Price amount={order.taxAmount} size="sm" className="font-bold text-manifest-ink" />
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs font-bold text-manifest-ink font-display">TOTAL TRANSAKSI</span>
                  <Price amount={order.totalAmount} size="xl" className="font-bold text-sea-deep text-lg" />
                </div>

                {/* Cancel Overdue Button */}
                {isOverdue() && (
                  <Button
                    onClick={handleCancelOverdue}
                    disabled={cancelling}
                    className="w-full bg-tide-coral hover:bg-tide-coral/95 text-white rounded-lg py-5 font-bold text-xs border-0 mt-3 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Membatalkan...</span>
                      </>
                    ) : (
                      <span>Batalkan & Refund (Overdue)</span>
                    )}
                  </Button>
                )}
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
