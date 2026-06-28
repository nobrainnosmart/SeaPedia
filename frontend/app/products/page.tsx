"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchProducts = async (search = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/products?search=${encodeURIComponent(search)}`);
      setProducts(res.data.products);
    } catch (err) {
      console.error("Gagal memuat katalog produk:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Katalog Produk</h1>
          <p className="text-zinc-500 font-light mt-1 font-light">Temukan berbagai produk berkualitas dari mitra penjual terpercaya kami.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
          <Input
            placeholder="Cari nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-zinc-200 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500 animate-pulse">Memuat katalog...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
          <p className="text-zinc-400 font-light">Tidak ada produk yang tersedia saat ini.</p>
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
                  {/* Gray Box Image Placeholder */}
                  <div className="h-48 bg-zinc-100 flex items-center justify-center border-b border-zinc-200">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-zinc-300 tracking-wider">{initials}</span>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg font-bold text-zinc-900 leading-tight">{product.name}</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-zinc-400 font-medium">
                      Store: {product.store?.name || "Toko Penjual"}
                    </CardDescription>
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
  );
}
