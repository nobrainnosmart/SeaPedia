"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(100, "Nama produk maksimal 100 karakter"),
  description: z.string().min(1, "Deskripsi produk wajib diisi").max(1000, "Deskripsi maksimal 1000 karakter"),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ message: "Harga wajib diisi" }).positive("Harga harus lebih besar dari 0")
  ),
  stock: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ message: "Stok wajib diisi" }).int().min(0, "Stok tidak boleh negatif")
  ),
  imageUrl: z.string().url("URL gambar tidak valid").or(z.string().length(0)).optional().nullable(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    try {
      await api.post("/seller/products", data);
      toast.success("Produk berhasil ditambahkan!");
      router.push("/seller/products");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menambahkan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        <div className="space-y-6">
          <Link
            href="/seller/products"
            className="text-xs text-muted-foreground hover:text-manifest-ink transition flex items-center gap-1.5 w-fit p-1 rounded hover:bg-sea-foam/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Inventori</span>
          </Link>

          <Card className="max-w-xl mx-auto border border-line bg-white rounded-default shadow-card text-manifest-ink">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold font-display text-sea-deep">Tambah Produk Baru</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-light">Unggah katalog produk baru untuk dijual di toko Anda.</CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nama Produk</label>
                  <Input
                    placeholder="Contoh: Lampu Solar Panel"
                    {...register("name")}
                    className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid"
                  />
                  {errors.name && (
                    <p className="text-[10px] text-tide-coral font-light mt-1">{errors.name.message as string}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Deskripsi</label>
                  <textarea
                    placeholder="Detail spesifikasi, ukuran, garansi, atau petunjuk penggunaan..."
                    {...register("description")}
                    rows={4}
                    className="w-full rounded-lg border border-line p-3 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-sea-mid transition"
                  />
                  {errors.description && (
                    <p className="text-[10px] text-tide-coral font-light mt-1">{errors.description.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Harga Jual (Rp)</label>
                    <Input
                      type="number"
                      placeholder="Contoh: 150000"
                      {...register("price")}
                      className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid font-mono"
                    />
                    {errors.price && (
                      <p className="text-[10px] text-tide-coral font-light mt-1">{errors.price.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Stok Awal</label>
                    <Input
                      type="number"
                      placeholder="Contoh: 20"
                      {...register("stock")}
                      className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid font-mono"
                    />
                    {errors.stock && (
                      <p className="text-[10px] text-tide-coral font-light mt-1">{errors.stock.message as string}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">URL Gambar Produk (Opsional)</label>
                  <Input
                    placeholder="https://example.com/gambar-produk.jpg"
                    {...register("imageUrl")}
                    className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid"
                  />
                  {errors.imageUrl && (
                    <p className="text-[10px] text-tide-coral font-light mt-1">{errors.imageUrl.message as string}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 justify-end border-t border-line pt-4 mt-4">
                <Link
                  href="/seller/products"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-lg text-xs h-9")}
                >
                  Batal
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg px-4 h-9 text-xs font-bold border-0 shadow-sm flex items-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Tambah Produk</span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
