"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Package, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import Price from "@/components/ui/Price";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Sticky Header with Search */}
      <div className="bg-white/80 backdrop-blur-md rounded-default border border-line p-6 mb-8 sticky top-18 z-30 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-sea-deep">Katalog Produk</h1>
          <p className="text-muted-foreground text-xs font-light mt-0.5">
            Cari dan temukan pasokan logistik dari berbagai wilayah.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Result Count */}
          <span className="hidden sm:inline font-mono text-xs text-muted-foreground tabular-nums shrink-0">
            {products.length} produk ditemukan
          </span>
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid focus-visible:border-transparent shadow-inner"
            />
          </div>
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border border-line bg-white rounded-default p-0 overflow-hidden flex flex-col h-[340px] shadow-card">
                <Skeleton className="h-40 w-full bg-sea-foam/50 rounded-none animate-pulse" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-sea-foam/50 animate-pulse" />
                    <Skeleton className="h-3 w-1/2 bg-sea-foam/50 animate-pulse" />
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-line">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-8 bg-sea-foam/50 animate-pulse" />
                      <Skeleton className="h-4 w-16 bg-sea-foam/50 animate-pulse" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded bg-sea-foam/50 animate-pulse" />
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
            className="flex flex-col items-center justify-center py-20 bg-white border border-line rounded-default shadow-card text-center"
          >
            <div className="p-4 rounded-full bg-sea-foam text-sea-mid mb-4 border border-line">
              <Search className="h-8 w-8 stroke-1" />
            </div>
            <h3 className="text-base font-bold font-display text-manifest-ink">Produk tidak ditemukan</h3>
            <p className="text-xs text-muted-foreground font-light mt-1 max-w-xs">
              Kami tidak dapat menemukan produk yang sesuai. Coba kata kunci lain atau periksa ejaan Anda.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="products"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => {
              return (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  whileHover={{ y: -4 }}
                  className="h-full flex transition-transform duration-300 group"
                >
                  <Card className="border border-line bg-white rounded-default shadow-card hover:shadow-lift flex flex-col justify-between overflow-hidden w-full transition-shadow duration-300">
                    <div>
                      {/* Image Area */}
                      <div className="aspect-square bg-gradient-to-br from-sea-foam to-white flex items-center justify-center border-b border-line relative overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60 transition-transform duration-500 group-hover:scale-105">
                            <Package className="h-8 w-8 stroke-1" />
                            <span className="text-[10px] font-semibold tracking-wider uppercase">No Image</span>
                          </div>
                        )}
                      </div>

                      <CardHeader className="p-4 pb-2 space-y-1">
                        <CardTitle className="text-sm font-bold text-manifest-ink line-clamp-2 leading-snug min-h-[40px] font-display">
                          {product.name}
                        </CardTitle>
                        
                        {product.store && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-sea-mid font-medium">
                            <Store className="h-3 w-3 shrink-0" />
                            <Link href={`/stores/${product.store.id}`} className="truncate hover:underline">
                              {product.store.name}
                            </Link>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="px-4 pb-3">
                        <p className="text-xs text-muted-foreground line-clamp-2 font-light leading-relaxed">
                          {product.description}
                        </p>
                      </CardContent>
                    </div>

                    <CardFooter className="p-4 pt-3 border-t border-line flex items-center justify-between bg-sea-foam/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-light">Harga</span>
                        <Price amount={product.price} size="base" className="font-bold text-manifest-ink" />
                      </div>
                      <Link
                        href={`/products/${product.id}`}
                        className={cn(
                          buttonVariants({ size: "sm" }),
                          "bg-sea-mid hover:bg-sea-mid/90 text-white rounded-lg px-3 py-1 h-8 text-xs font-semibold shadow-sm transition-transform hover:scale-[1.02]"
                        )}
                      >
                        Detail
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
