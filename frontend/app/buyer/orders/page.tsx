"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Eye } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/buyer/orders");
      setOrders(res.data);
    } catch (err) {
      toast.error("Gagal memuat riwayat transaksi.");
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
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat riwayat pesanan...</div>
        ) : orders.length === 0 ? (
          <Card className="max-w-xl mx-auto border border-zinc-200 bg-white rounded-3xl p-8 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Belum Ada Transaksi</h2>
            <p className="text-zinc-500 font-light mb-6">Anda belum pernah melakukan pemesanan barang.</p>
            <Link href="/products" className={cn(buttonVariants(), "bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg")}>
              Mulai Belanja
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Transaksi Saya</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">Pantau status pengiriman dan riwayat belanja Anda.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Nomor Pesanan</th>
                      <th className="px-6 py-4">Toko</th>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Total Belanja</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 text-sm text-zinc-700">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-zinc-900">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">{order.store?.name}</td>
                        <td className="px-6 py-4 text-xs text-zinc-400">
                          {new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-900">
                          Rp {order.totalAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStatusColor(order.status)}`}>
                            {order.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/buyer/orders/${order.id}`}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg border-zinc-200 flex items-center gap-1 w-fit")}
                          >
                            <Eye className="h-4 w-4" />
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
