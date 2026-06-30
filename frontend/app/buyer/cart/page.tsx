"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, Trash2, AlertCircle, Plus, Minus, ArrowRight, Store } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Price from "@/components/ui/Price";

export default function BuyerCartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get("/buyer/cart");
      setCart(res.data);
    } catch (err) {
      toast.error("Gagal memuat isi keranjang belanja.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number, currentStock: number) => {
    if (newQty < 1) return;
    if (newQty > currentStock) {
      toast.error(`Kuantitas melebihi stok yang tersedia (${currentStock} pcs).`);
      return;
    }

    try {
      const res = await api.put(`/buyer/cart/items/${itemId}`, { quantity: newQty });
      setCart(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal memperbarui kuantitas.");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res = await api.delete(`/buyer/cart/items/${itemId}`);
      setCart(res.data);
      toast.success("Produk dihapus dari keranjang.");
    } catch (err) {
      toast.error("Gagal menghapus produk.");
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Kosongkan semua isi keranjang?")) return;
    try {
      const res = await api.delete("/buyer/cart");
      setCart(res.data);
      toast.success("Keranjang dikosongkan.");
    } catch (err) {
      toast.error("Gagal mengosongkan keranjang.");
    }
  };

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Keranjang...</span>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-line rounded-default max-w-md mx-auto shadow-card flex flex-col items-center">
            <div className="p-4 rounded-full bg-sea-foam text-sea-mid mb-4 border border-line">
              <ShoppingCart className="h-8 w-8 stroke-1" />
            </div>
            <h2 className="text-base font-bold font-display text-manifest-ink">Keranjang Belanja Kosong</h2>
            <p className="text-muted-foreground text-xs font-light mt-1 mb-6 text-center max-w-xs leading-relaxed">
              Anda belum menambahkan produk apa pun. Jelajahi katalog logistik kami dan mulai belanja.
            </p>
            <Link
              href="/products"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-cargo-amber hover:bg-cargo-amber/90 text-white font-bold px-5 h-9 rounded-lg border-0 shadow-sm transition-transform hover:scale-[1.02]"
              )}
            >
              Jelajahi Produk
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sea-mid">Transaksi</span>
              <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">Keranjang Belanja</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">Kelola barang belanjaan pilihan Anda sebelum melakukan pembayaran.</p>
            </div>

            {/* Single-Store Info Banner */}
            <div className="flex items-start gap-3 bg-sea-foam/50 border border-line rounded-default p-4 text-manifest-ink text-xs leading-relaxed">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-sea-mid mt-0.5" />
              <div>
                <span className="font-semibold text-sea-mid">Info Rute Tunggal:</span> Keranjang belanja Anda saat ini berisi barang dari mitra <strong className="font-bold">{cart.store?.name}</strong>. Satu checkout hanya diperbolehkan untuk satu toko demi efisiensi rute kurir cargo.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item: any) => {
                  const initials = item.product.name
                    .split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <Card key={item.id} className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        {/* Image area */}
                        <div className="h-14 w-14 bg-sea-foam/25 rounded-lg flex items-center justify-center shrink-0 border border-line overflow-hidden">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground/60">{initials}</span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-manifest-ink leading-snug line-clamp-1">{item.product.name}</h3>
                          <div className="mt-1">
                            <Price amount={item.product.price} size="sm" className="text-muted-foreground" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-line">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-line rounded-lg overflow-hidden bg-sea-foam/5 h-8">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground rounded-none hover:bg-sea-foam border-0"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.product.stock)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-manifest-ink bg-white border-l border-r border-line py-1.5 tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground rounded-none hover:bg-sea-foam border-0"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.product.stock)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-3">
                          <Price amount={item.product.price * item.quantity} size="base" className="font-bold text-manifest-ink" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-tide-coral hover:bg-tide-coral/5 rounded-lg border-0"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Summary Card (Desktop sticky, mobile fallback handled standard) */}
              <div className="lg:col-span-1">
                <Card className="border border-line bg-white rounded-default shadow-card p-5 space-y-5 sticky top-20">
                  <h2 className="text-sm font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground pb-2 border-b border-line">
                    Ringkasan Belanja
                  </h2>

                  <div className="space-y-2.5 font-light text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Jumlah Barang</span>
                      <span className="font-mono font-bold text-manifest-ink tabular-nums">
                        {cart.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} unit
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span>Asal Pengiriman</span>
                      <span className="font-bold text-manifest-ink flex items-center gap-1 truncate max-w-[150px]">
                        <Store className="h-3 w-3 shrink-0 text-sea-mid" />
                        <span className="truncate">{cart.store?.name}</span>
                      </span>
                    </div>
                  </div>

                  <hr className="border-t border-line" />

                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground font-light">Subtotal</span>
                    <Price amount={cart.subtotal} size="xl" className="font-bold text-sea-deep text-lg" />
                  </div>

                  <div className="space-y-3 pt-2">
                    <Link
                      href="/buyer/checkout"
                      className={cn(
                        buttonVariants(),
                        "w-full bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg py-5 flex items-center justify-center gap-2 text-xs font-bold border-0 shadow-sm transition-transform hover:scale-[1.01]"
                      )}
                    >
                      Lanjut ke Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={handleClearCart}
                      className="w-full text-center text-xs text-muted-foreground hover:text-tide-coral font-light hover:underline bg-transparent border-0 cursor-pointer pt-1"
                    >
                      Kosongkan Keranjang Belanja
                    </button>
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
