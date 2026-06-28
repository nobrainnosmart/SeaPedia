"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Clock, MapPin, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function BuyerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SEDANG_DIKEMAS":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "MENUNGGU_PENGIRIM":
        return "bg-purple-50 text-purple-700 ring-purple-600/20";
      case "SEDANG_DIKIRIM":
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
      case "PESANAN_SELESAI":
        return "bg-green-50 text-green-700 ring-green-600/20";
      case "DIKEMBALIKAN":
        return "bg-red-50 text-red-700 ring-red-600/20";
      default:
        return "bg-zinc-50 text-zinc-700 ring-zinc-600/20";
    }
  };

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat detail pesanan...</div>
        ) : (
          <div className="space-y-8">
            <Link
              href="/buyer/orders"
              className={cn(buttonVariants({ variant: "ghost" }), "mb-4 hover:bg-zinc-100 rounded-lg flex items-center gap-1 w-fit")}
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Transaksi
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="text-2xl font-bold text-zinc-950">Detail Pesanan</h1>
                  <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", getStatusColor(order.status))}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm font-mono">ID: #{order.id.toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Items and Address */}
              <div className="lg:col-span-2 space-y-6">
                {/* Items */}
                <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-zinc-950 mb-4">Barang Belanjaan</h2>
                  <div className="divide-y divide-zinc-150">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                        <div>
                          <p className="font-bold text-zinc-900 leading-snug">{item.productName}</p>
                          <p className="text-xs text-zinc-500 font-light mt-1">
                            {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <span className="font-bold text-zinc-900">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Delivery Info */}
                <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      Alamat Tujuan
                    </h3>
                    <div className="text-sm text-zinc-700 font-light leading-relaxed">
                      <p className="font-semibold text-zinc-800">{order.deliveryAddress?.recipientName}</p>
                      <p>{order.deliveryAddress?.phone}</p>
                      <p>{order.deliveryAddress?.addressLine}</p>
                      <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.province} {order.deliveryAddress?.postalCode}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-zinc-400" />
                      Metode Pengiriman
                    </h3>
                    <div className="text-sm text-zinc-700 font-light">
                      <p className="font-semibold text-zinc-800">{order.deliveryMethod}</p>
                      <p className="mt-1">Ongkos Kirim: <strong>Rp {order.deliveryFee.toLocaleString("id-ID")}</strong></p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Status Tracker & Calculations */}
              <div className="lg:col-span-1 space-y-6">
                {/* Total Invoice */}
                <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-zinc-950">Rincian Pembayaran</h2>
                  <div className="space-y-2.5 text-sm text-zinc-500 font-light border-b border-zinc-150 pb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-zinc-900">Rp {order.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Potongan Diskon</span>
                        <span className="font-medium">-Rp {order.discountAmount.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Ongkos Kirim</span>
                      <span className="font-medium text-zinc-900">Rp {order.deliveryFee.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PPN (12% Base)</span>
                      <span className="font-medium text-zinc-900">Rp {order.taxAmount.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-sm font-semibold text-zinc-700">Total Transaksi</span>
                    <span className="text-xl font-extrabold text-zinc-950">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </Card>

                {/* Timeline */}
                <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-zinc-950 mb-6 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-500" />
                    Lacak Pesanan
                  </h2>
                  <div className="relative border-l-2 border-zinc-150 pl-6 ml-3 space-y-6">
                    {order.statusHistory.map((history: any, index: number) => (
                      <div key={history.id} className="relative">
                        {/* Dot Indicator */}
                        <div className={cn(
                          "absolute -left-[31px] top-1 h-4.5 w-4.5 rounded-full border-2 border-white flex items-center justify-center shadow-sm",
                          index === 0 ? "bg-indigo-500" : "bg-zinc-300"
                        )} />
                        <div>
                          <p className="text-xs text-zinc-400 font-medium">
                            {new Date(history.createdAt).toLocaleString("id-ID")}
                          </p>
                          <p className={cn("text-sm font-bold mt-0.5", index === 0 ? "text-zinc-900" : "text-zinc-500")}>
                            {history.status.replace("_", " ")}
                          </p>
                          {history.note && (
                            <p className="text-xs text-zinc-500 mt-1 font-light leading-relaxed">
                              {history.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
