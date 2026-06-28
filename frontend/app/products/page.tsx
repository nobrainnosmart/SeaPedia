"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 16 } }
} as const;

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
          <p className="text-zinc-500 font-light mt-1">Temukan berbagai produk berkualitas dari mitra penjual terpercaya kami.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
          <Input
            placeholder="Cari nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-zinc-200 bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-zinc-950"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border border-zinc-200 bg-white rounded-2xl p-0 overflow-hidden flex flex-col h-[400px]">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full mt-4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-lg" />
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 bg-white border border-zinc-200 rounded-3xl shadow-sm"
          >
            <p className="text-zinc-400 font-light">Tidak ada produk yang tersedia saat ini.</p>
          </motion.div>
        ) : (
          <motion.div
            key="products"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((product) => {
              const initials = product.name
                .split(" ")
                .map((word: string) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  whileHover={{ y: -6, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                  className="h-full flex"
                >
                  <Card className="border border-zinc-200 bg-white rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden w-full transition-shadow duration-300">
                    <div>
                      {/* Gray Box Image Placeholder */}
                      <div className="h-48 bg-zinc-100 flex items-center justify-center border-b border-zinc-200 relative overflow-hidden group">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-zinc-300 tracking-wider transition-transform duration-500 group-hover:scale-110">{initials}</span>
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
                        className={cn(buttonVariants({ size: "sm" }), "bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]")}
                      >
                        Lihat Detail
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
