"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, Store, Trash2, AlertCircle, Plus, Minus, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

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
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat keranjang...</div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl max-w-xl mx-auto shadow-sm">
            <ShoppingCart className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Keranjang Belanja Kosong</h2>
            <p className="text-zinc-500 font-light mb-6">Jelajahi berbagai produk terbaik kami dan tambahkan ke keranjang Anda.</p>
            <Link
              href="/products"
              className={cn(buttonVariants(), "bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg")}
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Keranjang Belanja</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">Kelola barang belanjaan pilihan Anda sebelum melakukan pembayaran.</p>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-amber-50/50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm leading-relaxed">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-semibold">Informasi Single-Store Checkout:</span> SEAPEDIA menggunakan sistem satu toko per checkout. Keranjang belanja Anda saat ini hanya bisa berisi produk dari toko <strong className="font-bold">{cart.store?.name}</strong>.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <Card key={item.id} className="border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Image Placeholder */}
                        <div className="h-16 w-16 bg-zinc-100 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-200 overflow-hidden">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-zinc-400">{initials}</span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-zinc-900 leading-snug">{item.product.name}</h3>
                          <p className="text-sm text-zinc-500 font-light mt-1">
                            Rp {item.product.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                        {/* Stepper */}
                        <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-600 rounded-none hover:bg-zinc-150"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.product.stock)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-10 text-center text-sm font-bold text-zinc-800 bg-white border-l border-r border-zinc-200 py-1">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-600 rounded-none hover:bg-zinc-150"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.product.stock)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-bold text-zinc-950 text-sm sm:text-base">
                            Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Summary Card */}
              <div className="lg:col-span-1">
                <Card className="border border-zinc-200 bg-white rounded-3xl shadow-sm p-6 space-y-6 sticky top-6">
                  <h2 className="text-lg font-bold text-zinc-950">Ringkasan Belanja</h2>

                  <div className="space-y-3 font-light text-sm text-zinc-600 border-b border-zinc-100 pb-4">
                    <div className="flex justify-between">
                      <span>Total Barang</span>
                      <span className="font-semibold text-zinc-900">{cart.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Asal Toko</span>
                      <span className="font-semibold text-zinc-900">{cart.store?.name}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-zinc-500 font-light">Subtotal</span>
                    <span className="text-xl font-bold text-zinc-950">
                      Rp {cart.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Link
                      href="/buyer/checkout"
                      className={cn(buttonVariants(), "w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl py-6 flex items-center justify-center gap-2")}
                    >
                      Lanjut ke Checkout
                      <ArrowRight className="h-4.5 w-4.5" />
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleClearCart}
                      className="w-full border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-zinc-600 rounded-xl"
                    >
                      Kosongkan Keranjang
                    </Button>
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
