"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ShoppingCart, Store, Plus, Minus, Package } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getUser, isLoggedIn } from "@/lib/auth";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import Price from "@/components/ui/Price";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isConflictOpen, setIsConflictOpen] = useState(false);

  useEffect(() => {
    setUser(isLoggedIn() ? getUser() : null);
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${params.id}`);
      setProduct(res.data);
    } catch (err) {
      console.error("Gagal memuat produk:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await api.post("/buyer/cart/items", { productId: product.id, quantity });
      toast.success(`${quantity} x ${product.name} berhasil ditambahkan ke keranjang!`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setIsConflictOpen(true);
      } else {
        toast.error(err.response?.data?.error || "Gagal menambahkan produk ke keranjang.");
      }
    }
  };

  const handleClearAndAdd = async () => {
    try {
      await api.delete("/buyer/cart");
      await api.post("/buyer/cart/items", { productId: product.id, quantity });
      toast.success(`${quantity} x ${product.name} ditambahkan ke keranjang baru!`);
      setIsConflictOpen(false);
    } catch (err) {
      toast.error("Gagal mengosongkan keranjang.");
    }
  };

  const incrementQty = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-9 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Skeleton className="h-96 w-full rounded-default" />
          </div>
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-32 w-full mt-6" />
            </div>
            <Skeleton className="h-24 w-full rounded-default" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <p className="text-muted-foreground font-light text-xs">Produk tidak ditemukan.</p>
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "link" }), "mt-4 flex items-center justify-center gap-1 text-sea-mid font-semibold")}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const isBuyer = user?.activeRole === "BUYER";
  const initials = product.name
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-12">
      {/* Breadcrumbs & Back */}
      <div className="flex flex-col gap-2 mb-6">
        <Link
          href="/products"
          className="text-xs text-muted-foreground hover:text-sea-mid transition flex items-center gap-1.5 w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Katalog</span>
        </Link>
        
        {/* Breadcrumb */}
        <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 mt-2">
          <Link href="/" className="hover:underline">Beranda</Link>
          <span>/</span>
          <Link href="/products" className="hover:underline">Produk</Link>
          <span>/</span>
          <span className="text-manifest-ink truncate max-w-[150px]">{product.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Area (40%) */}
        <div className="lg:col-span-5">
          <div className="aspect-square bg-gradient-to-br from-sea-foam to-white rounded-default flex items-center justify-center border border-line overflow-hidden shadow-card relative">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                <Package className="h-14 w-14 stroke-1" />
                <span className="text-xs font-semibold tracking-wider uppercase">{initials}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details Area (60%) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-manifest-ink leading-snug">{product.name}</h1>
            
            <div className="mt-3">
              <Price amount={product.price} size="3xl" className="text-sea-deep font-bold" />
            </div>

            {/* Store Info Card */}
            <div className="border border-line rounded-default p-4 my-6 bg-sea-foam/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-role-seller text-white rounded-full flex items-center justify-center text-xs font-bold shadow-inner">
                  {product.store?.name ? getInitials(product.store.name) : "S"}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-manifest-ink">{product.store?.name || "Toko Mitra"}</h4>
                  <p className="text-[10px] text-muted-foreground font-light flex items-center gap-1 mt-0.5">
                    <Store className="h-3 w-3" /> Partner Penjual Resmi
                  </p>
                </div>
              </div>
              <Link
                href={`/stores/${product.store?.id}`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-xs text-sea-mid font-semibold hover:bg-sea-foam border border-line h-8"
                )}
              >
                Lihat Toko
              </Link>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Deskripsi Produk</h3>
              <p className="text-muted-foreground text-xs font-light leading-relaxed whitespace-pre-line bg-white/50 border border-line rounded-lg p-4">
                {product.description || "Tidak ada deskripsi produk."}
              </p>
            </div>

            {/* Stock Level */}
            <div className="flex items-center justify-between border-b border-line pb-4 mt-6">
              <span className="text-xs text-muted-foreground font-light">Ketersediaan Stok</span>
              {product.stock > 0 ? (
                <span className="font-mono text-xs text-manifest-ink font-semibold tabular-nums">
                  {product.stock} unit tersedia
                </span>
              ) : (
                <span className="font-semibold text-xs text-tide-coral">
                  Stok Habis
                </span>
              )}
            </div>
          </div>

          {/* Action Area (Desktop) */}
          <div className="hidden md:block">
            <Card className="border border-line bg-white rounded-default p-5 shadow-card">
              <CardContent className="p-0 flex items-center justify-between gap-6">
                {isBuyer && product.stock > 0 ? (
                  <>
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-line rounded-lg bg-sea-foam/5 overflow-hidden h-10 px-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={decrementQty}
                        disabled={quantity <= 1}
                        className="h-8 w-8 text-muted-foreground disabled:opacity-30 border-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center text-xs font-mono font-bold text-manifest-ink tabular-nums">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={incrementQty}
                        disabled={quantity >= product.stock}
                        className="h-8 w-8 text-muted-foreground disabled:opacity-30 border-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg py-5 flex items-center justify-center gap-2 shadow-sm text-xs font-bold border-0 cursor-pointer h-10"
                    >
                      <ShoppingCart className="h-4.5 w-4.5" />
                      Tambah ke Keranjang
                    </Button>
                  </>
                ) : !isBuyer ? (
                  <div className="w-full text-center py-1">
                    <p className="text-muted-foreground text-xs font-light mb-3 leading-relaxed">
                      {user 
                        ? `Anda terdaftar sebagai ${user.activeRole?.toLowerCase()}. Silakan alihkan peran Anda untuk melakukan pembelian.`
                        : "Masuk sebagai pembeli untuk menambahkan produk ini ke keranjang belanja Anda."}
                    </p>
                    <Link
                      href={user ? "/auth/select-role" : "/auth/login"}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "w-full bg-manifest-ink hover:bg-manifest-ink/90 text-white font-bold rounded-lg text-xs h-9 py-2"
                      )}
                    >
                      {user ? "Pilih Peran Pembeli" : "Masuk Sekarang"}
                    </Link>
                  </div>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-muted text-muted-foreground/60 border border-line rounded-lg h-10 text-xs font-semibold cursor-not-allowed"
                  >
                    Stok Tidak Tersedia
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar (Mobile only) */}
      {product.stock > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line px-4 py-3 z-45 flex items-center justify-between gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground">Total Estimasi</span>
            <Price amount={product.price * quantity} size="lg" className="font-bold text-sea-deep" />
          </div>
          
          {isBuyer ? (
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-line rounded-lg bg-sea-foam/5 overflow-hidden h-9 px-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementQty}
                  disabled={quantity <= 1}
                  className="h-7 w-7 text-muted-foreground disabled:opacity-30 border-0"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-8 text-center text-xs font-mono font-bold text-manifest-ink tabular-nums">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementQty}
                  disabled={quantity >= product.stock}
                  className="h-7 w-7 text-muted-foreground disabled:opacity-30 border-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                className="bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg px-4 flex items-center justify-center gap-1.5 shadow-sm text-xs font-bold border-0 h-9"
              >
                <ShoppingCart className="h-4 w-4" />
                Beli
              </Button>
            </div>
          ) : (
            <Link
              href={user ? "/auth/select-role" : "/auth/login"}
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-manifest-ink hover:bg-manifest-ink/90 text-white font-bold rounded-lg text-xs h-9"
              )}
            >
              Masuk
            </Link>
          )}
        </div>
      )}

      {/* Conflict Dialog */}
      <Dialog open={isConflictOpen} onOpenChange={setIsConflictOpen}>
        <DialogContent className="max-w-md bg-white rounded-default border border-line p-6 text-manifest-ink">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-base font-bold font-display text-sea-deep">Ganti Keranjang Belanja?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed font-light mt-1">
              Keranjang belanja Anda saat ini sudah berisi barang dari toko lain. Satu keranjang hanya diperbolehkan berisi barang dari satu toko saja. Apakah Anda bersedia mengosongkan keranjang saat ini untuk menambahkan produk ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-line">
            <Button variant="ghost" onClick={() => setIsConflictOpen(false)} className="rounded-lg text-xs h-9">
              Batal
            </Button>
            <Button 
              onClick={handleClearAndAdd} 
              className="bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg px-4 h-9 text-xs font-bold border-0 shadow-sm"
            >
              Ya, Kosongkan & Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
