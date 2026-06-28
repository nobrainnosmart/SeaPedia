"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Store } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function StoreProfilePage() {
  const params = useParams();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStore();
  }, [params.id]);

  const fetchStore = async () => {
    try {
      const res = await api.get(`/stores/${params.id}`);
      setStore(res.data.store);
      setProducts(res.data.products);
    } catch (err) {
      console.error("Gagal memuat toko:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-500 animate-pulse">
        Memuat profil toko...
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-500 font-light">Toko tidak ditemukan.</p>
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "link" }), "mt-4 flex items-center justify-center gap-1")}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <Link
        href="/products"
        className={cn(buttonVariants({ variant: "ghost" }), "mb-8 hover:bg-zinc-100 rounded-lg flex items-center gap-1 w-fit")}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Katalog
      </Link>

      {/* Store Header Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 mb-12">
        <div className="h-20 w-20 bg-zinc-150 text-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-200 shrink-0">
          <Store className="h-10 w-10" />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-zinc-950">{store.name}</h1>
          <p className="text-zinc-500 font-light text-sm mt-1 leading-relaxed max-w-xl">
            {store.description || "Belum ada deskripsi tentang toko ini."}
          </p>
        </div>
      </div>

      {/* Product Catalog */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Katalog Produk Toko</h2>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
            <p className="text-zinc-400 font-light">Toko ini belum menambahkan produk.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const initials = product.name
                .split(" ")
                .map((word: string) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <Card key={product.id} className="border border-zinc-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
                  <div>
                    {/* Image Placeholder */}
                    <div className="h-48 bg-zinc-100 flex items-center justify-center border-b border-zinc-200">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-zinc-300 tracking-wider">{initials}</span>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-zinc-900 leading-tight">{product.name}</CardTitle>
                      <CardDescription className="text-xs text-zinc-400 font-light">Stok: {product.stock} unit</CardDescription>
                    </CardHeader>

                    <CardContent className="pb-3">
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-light">{product.description}</p>
                    </CardContent>
                  </div>

                  <CardFooter className="pt-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-400 font-light">Harga</span>
                      <span className="text-base font-bold text-zinc-950">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <Link
                      href={`/products/${product.id}`}
                      className={cn(buttonVariants({ size: "sm" }), "bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg")}
                    >
                      Lihat Detail
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
