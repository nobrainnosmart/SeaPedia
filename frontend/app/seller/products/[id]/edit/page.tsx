"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${params.id}`);
      const prod = res.data;
      setValue("name", prod.name);
      setValue("description", prod.description);
      setValue("price", prod.price);
      setValue("stock", prod.stock);
      setValue("imageUrl", prod.imageUrl || "");
    } catch (err: any) {
      toast.error("Gagal memuat detail produk.");
      router.push("/seller/products");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    setSaving(true);
    try {
      await api.put(`/seller/products/${params.id}`, data);
      toast.success("Produk berhasil diperbarui!");
      router.push("/seller/products");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal memperbarui produk.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        <Link
          href="/seller/products"
          className={cn(buttonVariants({ variant: "ghost" }), "mb-6 hover:bg-zinc-100 rounded-lg flex items-center gap-1 w-fit")}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Inventori
        </Link>

        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat...</div>
        ) : (
          <Card className="max-w-xl mx-auto border border-zinc-200 bg-white rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Edit Detail Produk</CardTitle>
              <CardDescription className="font-light">Ubah detail spesifikasi, harga, atau stok produk Anda.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nama Produk</label>
                  <Input
                    placeholder="Nama produk"
                    {...register("name")}
                    className="rounded-lg border-zinc-200"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Deskripsi</label>
                  <textarea
                    placeholder="Detail spesifikasi..."
                    {...register("description")}
                    rows={4}
                    className="w-full rounded-lg border border-zinc-200 p-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-transparent transition"
                  />
                  {errors.description && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Harga (Rupiah)</label>
                    <Input
                      type="number"
                      placeholder="Harga"
                      {...register("price")}
                      className="rounded-lg border-zinc-200"
                    />
                    {errors.price && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Stok</label>
                    <Input
                      type="number"
                      placeholder="Stok"
                      {...register("stock")}
                      className="rounded-lg border-zinc-200"
                    />
                    {errors.stock && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.stock.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">URL Gambar (Opsional)</label>
                  <Input
                    placeholder="URL gambar"
                    {...register("imageUrl")}
                    className="rounded-lg border-zinc-200"
                  />
                  {errors.imageUrl && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.imageUrl.message}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-3 justify-end border-t border-zinc-100 pt-6 mt-4">
                <Link
                  href="/seller/products"
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-lg border-zinc-200")}
                >
                  Batal
                </Link>
                <Button type="submit" disabled={saving} className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg">
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
