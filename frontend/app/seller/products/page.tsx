"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState<any>(null);

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
    try {
      await api.delete(`/seller/products/${targetProduct.id}`);
      toast.success("Produk berhasil dihapus!");
      setProducts((prev) => prev.filter((p) => p.id !== targetProduct.id));
      setIsDeleteOpen(false);
      setTargetProduct(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menghapus produk.");
    }
  };

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat produk...</div>
        ) : !hasStore ? (
          <Card className="max-w-xl mx-auto border border-zinc-200 bg-white rounded-3xl p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Toko Belum Dibuat</h2>
            <p className="text-zinc-500 font-light mb-6">
              Silakan buat toko Anda terlebih dahulu di halaman Toko Saya untuk mulai mengunggah produk.
            </p>
            <Link
              href="/seller/store"
              className={cn(buttonVariants(), "bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg")}
            >
              Pergi ke Toko Saya
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-zinc-950">Produk Toko</h1>
                <p className="text-zinc-500 font-light text-sm mt-0.5">Kelola daftar inventori barang jualan toko Anda.</p>
              </div>
              <Link
                href="/seller/products/new"
                className={cn(buttonVariants(), "bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg flex items-center gap-1.5 w-fit")}
              >
                <Plus className="h-4 w-4" />
                Tambah Produk
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
                <p className="text-zinc-400 font-light">Belum ada produk. Tambahkan produk pertama Anda sekarang!</p>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Nama Produk</th>
                        <th className="px-6 py-4">Harga</th>
                        <th className="px-6 py-4">Stok</th>
                        <th className="px-6 py-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 text-sm text-zinc-700">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-zinc-900">{product.name}</td>
                          <td className="px-6 py-4 font-medium">Rp {product.price.toLocaleString("id-ID")}</td>
                          <td className="px-6 py-4">{product.stock} pcs</td>
                          <td className="px-6 py-4 flex gap-2">
                            <Link
                              href={`/seller/products/${product.id}/edit`}
                              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg border-zinc-200")}
                            >
                              <Pencil className="h-4 w-4 text-zinc-500" />
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmDelete(product)}
                              className="rounded-lg border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Confirm Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogContent className="max-w-md bg-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Hapus Produk</DialogTitle>
                  <DialogDescription className="font-light">
                    Apakah Anda yakin ingin menghapus <strong>{targetProduct?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-zinc-100">
                  <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-lg">
                    Batal
                  </Button>
                  <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-lg">
                    Hapus
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
