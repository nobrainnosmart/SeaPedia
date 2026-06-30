"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, ChevronRight, Play, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Price from "@/components/ui/Price";
import StatusBadge from "@/components/ui/StatusBadge";

type FilterType = "SEMUA" | "PERLU_DIPAK" | "SIAP_DIKIRIM" | "SEDANG_DIKIRIM" | "SELESAI" | "DIKEMBALIKAN";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("SEMUA");
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/seller/orders");
      setOrders(res.data);
    } catch (err) {
      toast.error("Gagal memuat pesanan masuk.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessOrder = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // prevent card click redirect
    e.preventDefault();
    setActioningId(orderId);
    try {
      await api.patch(`/seller/orders/${orderId}/process`);
      toast.success("Pesanan berhasil diproses dan siap dikirim!");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal memproses pesanan.");
    } finally {
      setActioningId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "PERLU_DIPAK") return o.status === "SEDANG_DIKEMAS";
    if (filter === "SIAP_DIKIRIM") return o.status === "MENUNGGU_PENGIRIM";
    if (filter === "SEDANG_DIKIRIM") return o.status === "SEDANG_DIKIRIM";
    if (filter === "SELESAI") return o.status === "PESANAN_SELESAI";
    if (filter === "DIKEMBALIKAN") return o.status === "DIKEMBALIKAN";
    return true;
  });

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "SEMUA", label: "Semua" },
    { key: "PERLU_DIPAK", label: "Perlu Dipak" },
    { key: "SIAP_DIKIRIM", label: "Siap Dikirim" },
    { key: "SEDANG_DIKIRIM", label: "Sedang Dikirim" },
    { key: "SELESAI", label: "Selesai" },
    { key: "DIKEMBALIKAN", label: "Dikembalikan" },
  ];

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Transaksi Toko...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-role-seller font-display">Operasional</span>
              <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">Pesanan Masuk</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">Kelola pesanan pelanggan dan konfirmasi status pengemasan paket.</p>
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
                <p className="text-muted-foreground text-xs font-light mt-1 text-center">
                  Tidak ada pesanan masuk dengan kategori filter "{filter.toLowerCase().replace("_", " ")}".
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isPendingPacking = order.status === "SEDANG_DIKEMAS";
                  const itemCount = order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 1;
                  return (
                    <Link key={order.id} href={`/seller/orders/${order.id}`}>
                      <div className={cn(
                        "border border-line rounded-default p-4 bg-white hover:bg-sea-foam/15 transition-all shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer relative",
                        isPendingPacking && "border-l-4 border-l-cargo-amber"
                      )}>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-manifest-ink font-bold">
                                #{order.id.slice(-8).toUpperCase()}
                              </span>
                              <span className="text-[10px] text-muted-foreground">&bull; Pembeli: <strong>{order.buyer?.username || "Pelanggan"}</strong></span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono tabular-nums">
                              Tanggal order: {new Date(order.createdAt).toLocaleDateString("id-ID", {
                                day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })} &bull; {itemCount} unit barang
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-line">
                          <StatusBadge status={order.status} />
                          <div className="flex items-center gap-3">
                            <Price amount={order.totalAmount} size="base" className="font-bold text-manifest-ink" />
                            
                            {isPendingPacking && (
                              <Button
                                size="xs"
                                onClick={(e) => handleProcessOrder(e, order.id)}
                                disabled={actioningId === order.id}
                                className="bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded px-3 h-7 text-[11px] font-bold border-0 shadow-sm flex items-center gap-1 shrink-0"
                              >
                                {actioningId === order.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Play className="h-3 w-3" />
                                )}
                                <span>Proses</span>
                              </Button>
                            )}
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
