"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Price from "@/components/ui/Price";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/seller/products");
      setProducts(res.data);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.error === "Buat toko terlebih dahulu") {
        setHasStore(false);
      } else {
        toast.error("Gagal memuat produk.");
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (product: any) => {
    setTargetProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!targetProduct) return;
    setDeleting(true);
    try {
      await api.delete(`/seller/products/${targetProduct.id}`);
      toast.success("Produk berhasil dihapus!");
      setProducts((prev) => prev.filter((p) => p.id !== targetProduct.id));
      setIsDeleteOpen(false);
      setTargetProduct(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menghapus produk.");
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Katalog Produk...</span>
          </div>
        ) : !hasStore ? (
          <Card className="max-w-xl mx-auto border border-line bg-white rounded-default p-8 text-center shadow-card flex flex-col items-center">
            <div className="p-4 rounded-full bg-role-seller/10 text-role-seller mb-4 border border-role-seller/10">
              <Package className="h-8 w-8 stroke-1" />
            </div>
            <h2 className="text-base font-bold font-display text-manifest-ink">Toko Belum Terdaftar</h2>
            <p className="text-muted-foreground text-xs font-light mt-1 mb-6 max-w-sm leading-relaxed">
              Silakan buat profil toko Anda terlebih dahulu di menu Toko Saya untuk mulai mengunggah produk sedia jual.
            </p>
            <Link
              href="/seller/store"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-cargo-amber hover:bg-cargo-amber/90 text-white font-bold px-5 h-9 rounded-lg border-0 shadow-sm"
              )}
            >
              Pergi ke Toko Saya
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-role-seller">Inventori</span>
                <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">Produk Toko</h1>
                <p className="text-muted-foreground text-xs font-light mt-0.5">Kelola daftar inventori barang jualan toko Anda.</p>
              </div>
              <Link
                href="/seller/products/new"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-cargo-amber hover:bg-cargo-amber/90 text-white font-bold px-4 h-9 rounded-lg border-0 shadow-sm flex items-center gap-1.5 w-fit shrink-0"
                )}
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Produk</span>
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-line rounded-default shadow-card flex flex-col items-center">
                <div className="p-4 rounded-full bg-sea-foam text-sea-mid mb-4 border border-line">
                  <Package className="h-8 w-8 stroke-1" />
                </div>
                <h2 className="text-base font-bold font-display text-manifest-ink">Katalog Masih Kosong</h2>
                <p className="text-muted-foreground text-xs font-light mt-1 mb-6">Tambahkan produk dagang pertama Anda sekarang.</p>
                <Link
                  href="/seller/products/new"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-cargo-amber hover:bg-cargo-amber/90 text-white font-bold px-5 h-9 rounded-lg border-0"
                  )}
                >
                  Tambah Produk Baru
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-line rounded-default overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-line bg-sea-foam/15 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="px-5 py-3.5 font-medium">Informasi Produk</th>
                        <th className="px-5 py-3.5 font-medium">Harga Jual</th>
                        <th className="px-5 py-3.5 font-medium">Stok</th>
                        <th className="px-5 py-3.5 text-right font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-xs text-manifest-ink">
                      {products.map((product) => {
                        const isLowStock = product.stock < 5;
                        return (
                          <tr key={product.id} className="hover:bg-sea-foam/5 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                {/* Thumbnail */}
                                <div className="h-10 w-10 bg-sea-foam/25 border border-line rounded flex items-center justify-center shrink-0 overflow-hidden text-[10px] font-bold text-muted-foreground">
                                  {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                  ) : (
                                    getInitials(product.name)
                                  )}
                                </div>
                                <span className="font-bold text-manifest-ink leading-tight">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <Price amount={product.price} size="sm" className="font-bold text-manifest-ink" />
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono tabular-nums",
                                isLowStock 
                                  ? "bg-tide-coral/15 text-tide-coral border border-tide-coral/10" 
                                  : "bg-role-seller/15 text-role-seller border border-role-seller/10"
                              )}>
                                {product.stock} pcs {isLowStock && "⚠️"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex justify-end gap-1.5">
                                <Link
                                  href={`/seller/products/${product.id}/edit`}
                                  className={cn(
                                    buttonVariants({ variant: "ghost", size: "icon" }),
                                    "h-7 w-7 text-muted-foreground hover:text-sea-mid hover:bg-sea-foam rounded border-0"
                                  )}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmDelete(product)}
                                  className="h-7 w-7 text-muted-foreground hover:text-tide-coral hover:bg-tide-coral/5 rounded border-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Confirm Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogContent className="max-w-md bg-white rounded-default border border-line p-6 text-manifest-ink">
                <DialogHeader className="mb-3">
                  <DialogTitle className="text-base font-bold font-display text-sea-deep">Hapus Produk</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground font-light mt-1">
                    Apakah Anda yakin ingin menghapus <strong>{targetProduct?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-line mt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsDeleteOpen(false)} className="rounded-lg text-xs h-9">
                    Batal
                  </Button>
                  <Button 
                    onClick={handleDelete} 
                    disabled={deleting}
                    className="bg-tide-coral hover:bg-tide-coral/95 text-white rounded-lg px-4 h-9 text-xs font-bold border-0 shadow-sm"
                  >
                    {deleting ? "Menghapus..." : "Hapus Produk"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
