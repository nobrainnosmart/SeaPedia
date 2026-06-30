"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, ChevronRight, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Price from "@/components/ui/Price";
import StatusBadge from "@/components/ui/StatusBadge";

type FilterType = "SEMUA" | "AKTIF" | "SELESAI" | "DIKEMBALIKAN";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("SEMUA");

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

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.slice(0, 2).toUpperCase();
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "AKTIF") {
      return ["SEDANG_DIKEMAS", "MENUNGGU_PENGIRIM", "SEDANG_DIKIRIM"].includes(o.status);
    }
    if (filter === "SELESAI") {
      return o.status === "PESANAN_SELESAI";
    }
    if (filter === "DIKEMBALIKAN") {
      return o.status === "DIKEMBALIKAN";
    }
    return true;
  });

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "SEMUA", label: "Semua Pesanan" },
    { key: "AKTIF", label: "Aktif" },
    { key: "SELESAI", label: "Selesai" },
    { key: "DIKEMBALIKAN", label: "Dikembalikan" },
  ];

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Daftar Transaksi...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sea-mid">Operasional</span>
              <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">Daftar Transaksi</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">Pantau status perjalanan kurir dan kelola riwayat belanja Anda.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-line gap-2 overflow-x-auto pb-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "text-xs font-semibold px-4 py-2.5 transition-all border-b-2 whitespace-nowrap outline-none cursor-pointer",
                    filter === tab.key
                      ? "border-cargo-amber text-cargo-amber"
                      : "border-transparent text-muted-foreground hover:text-manifest-ink"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white border border-line rounded-default shadow-card flex flex-col items-center">
                <div className="p-4 rounded-full bg-sea-foam text-sea-mid mb-4 border border-line">
                  <ShoppingBag className="h-8 w-8 stroke-1" />
                </div>
                <h2 className="text-base font-bold font-display text-manifest-ink">Tidak Ada Pesanan</h2>
                <p className="text-muted-foreground text-xs font-light mt-1 mb-6">
                  {filter === "SEMUA" 
                    ? "Anda belum melakukan pemesanan apa pun." 
                    : `Tidak ada pesanan dengan kategori filter "${filter.toLowerCase()}".`}
                </p>
                {filter === "SEMUA" && (
                  <Link 
                    href="/products" 
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "bg-cargo-amber hover:bg-cargo-amber/90 text-white font-bold px-5 h-9 rounded-lg border-0 shadow-sm"
                    )}
                  >
                    Mulai Belanja
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const itemCount = order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 1;
                  return (
                    <Link key={order.id} href={`/buyer/orders/${order.id}`}>
                      <div className="border border-line rounded-default p-4 bg-white hover:bg-sea-foam/15 transition-all shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-role-buyer/10 text-role-buyer rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border border-role-buyer/15">
                            {order.store?.name ? getInitials(order.store.name) : "S"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-manifest-ink flex items-center gap-1">
                                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                {order.store?.name || "Toko Mitra"}
                              </h4>
                              <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                                #{order.id.slice(-8).toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono tabular-nums">
                              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                                day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })} &bull; {itemCount} unit barang
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-line">
                          <StatusBadge status={order.status} />
                          <div className="flex items-center gap-2">
                            <Price amount={order.totalAmount} size="base" className="font-bold text-manifest-ink" />
                            <ChevronRight className="h-4.5 w-4.5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
