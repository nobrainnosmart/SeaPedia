"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, Package, ShoppingBag, Clock, Play, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import Price from "@/components/ui/Price";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SellerDashboard() {
  const [report, setReport] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const user = getUser();

  const fetchDashboardData = async () => {
    try {
      const [reportRes, ordersRes, productsRes] = await Promise.all([
        api.get("/seller/reports").catch(() => null),
        api.get("/seller/orders").catch(() => null),
        api.get("/seller/products").catch(() => null),
      ]);

      if (reportRes) setReport(reportRes.data);
      if (ordersRes) setOrders(ordersRes.data);
      if (productsRes) setProducts(productsRes.data);
    } catch (err) {
      toast.error("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleProcessOrder = async (orderId: string) => {
    setActioningId(orderId);
    try {
      await api.patch(`/seller/orders/${orderId}/process`);
      toast.success("Pesanan berhasil diproses dan siap dikirim!");
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal memproses pesanan.");
    } finally {
      setActioningId(null);
    }
  };

  // Filter orders needing packing/processing
  const pendingOrders = orders.filter((o) => o.status === "SEDANG_DIKEMAS");
  const recentProducts = products.slice(0, 4);

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-role-seller">Operasional Toko</span>
            <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">
              Selamat Datang, {user?.username || "Penjual"}
            </h1>
            <p className="text-muted-foreground text-xs font-light mt-0.5">
              Berikut ringkasan kinerja penjualan dan logistik toko Anda.
            </p>
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
              {/* Wallet Balance */}
              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col justify-between h-24">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Saldo Dompet</span>
                  <div className="p-1 rounded bg-role-seller/10 text-role-seller border border-role-seller/10">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <Price amount={report?.walletBalance || 0} size="xl" className="font-bold text-manifest-ink" />
              </Card>

              {/* Total Revenue */}
              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col justify-between h-24">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Pendapatan</span>
                  <div className="p-1 rounded bg-role-buyer/10 text-role-buyer border border-role-buyer/10">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>
                <Price amount={report?.totalRevenue || 0} size="xl" className="font-bold text-manifest-ink" />
              </Card>

              {/* Active Products */}
              <Card className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col justify-between h-24">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Produk Toko</span>
                  <div className="p-1 rounded bg-role-admin/10 text-role-admin border border-role-admin/10">
                    <Package className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-base font-bold text-manifest-ink font-mono tabular-nums">
                  {report?.productCount || 0} unit
                </span>
              </Card>

              {/* Pending Action count card with highlight */}
              <Card 
                className={cn(
                  "border p-4 rounded-default flex flex-col justify-between h-24 transition-all duration-300",
                  report?.pendingCount > 0 
                    ? "border-cargo-amber bg-cargo-amber/5 ring-1 ring-cargo-amber/10 shadow-sm" 
                    : "border-line bg-white shadow-card"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", report?.pendingCount > 0 ? "text-cargo-amber" : "text-muted-foreground")}>
                    Perlu Diproses
                  </span>
                  <div className={cn("p-1 rounded border", report?.pendingCount > 0 ? "bg-cargo-amber/20 border-cargo-amber/20 text-cargo-amber" : "bg-role-driver/10 border-role-driver/10 text-role-driver")}>
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <span className={cn("text-base font-bold font-mono tabular-nums", report?.pendingCount > 0 ? "text-cargo-amber" : "text-manifest-ink")}>
                  {report?.pendingCount || 0} pesanan
                </span>
              </Card>
            </div>
          )}

          {/* Perlu Diproses (SEDANG_DIKEMAS) */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground">
              Pesanan Perlu Diproses (Sedang Dikemas)
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 bg-sea-foam/50 rounded-lg animate-pulse border border-line" />
                ))}
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-10 bg-white border border-line rounded-default text-xs font-light text-muted-foreground shadow-card">
                Semua pesanan selesai dipaketkan. Bagus!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((o) => (
                  <div 
                    key={o.id} 
                    className="border-l-4 border-l-cargo-amber border-y border-r border-line rounded-r-default p-4 bg-white hover:bg-sea-foam/5 transition-all shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-manifest-ink font-bold">
                          #{o.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground">&bull; Pembeli: <strong>{o.buyer?.username || "Pelanggan"}</strong></span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono tabular-nums">
                        Tanggal masuk: {new Date(o.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-line">
                      <Price amount={o.totalAmount} className="font-bold text-manifest-ink" />
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          onClick={() => handleProcessOrder(o.id)}
                          disabled={actioningId === o.id}
                          className="bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded px-3 h-7 text-[11px] font-bold border-0 shadow-sm flex items-center gap-1"
                        >
                          {actioningId === o.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          <span>Proses</span>
                        </Button>
                        <Link 
                          href={`/seller/orders/${o.id}`}
                          className={cn(buttonVariants({ variant: "ghost", size: "xs" }), "h-7 text-xs font-semibold text-sea-mid hover:bg-sea-foam")}
                        >
                          Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Products */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground">
                Katalog Produk Teratas
              </h2>
              <Link href="/seller/products" className="text-xs font-bold text-role-seller hover:underline flex items-center gap-1">
                Kelola Produk
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 bg-sea-foam/50 rounded-default animate-pulse border border-line" />
                ))}
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="text-center py-10 bg-white border border-line rounded-default text-xs font-light text-muted-foreground shadow-card">
                Toko belum memiliki produk terdaftar. Mulai tambahkan barang jualan Anda.
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recentProducts.map((p) => {
                  const initials = p.name.slice(0, 2).toUpperCase();
                  return (
                    <Card key={p.id} className="border border-line bg-white rounded-default overflow-hidden shadow-card hover:shadow-lift transition-shadow duration-300 flex flex-col justify-between h-36">
                      <div className="p-3.5 space-y-1.5 min-w-0">
                        <h4 className="text-xs font-bold text-manifest-ink line-clamp-1 font-display" title={p.name}>
                          {p.name}
                        </h4>
                        <Price amount={p.price} size="sm" className="font-bold text-sea-deep block" />
                        <span className="text-[10px] text-muted-foreground font-mono tabular-nums block">
                          Stok: {p.stock} pcs
                        </span>
                      </div>
                      <div className="bg-sea-foam/10 border-t border-line px-3 py-2 flex justify-end">
                        <Link 
                          href={`/seller/products/${p.id}/edit`}
                          className="text-[10px] font-bold text-role-seller hover:underline"
                        >
                          Edit &rarr;
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
