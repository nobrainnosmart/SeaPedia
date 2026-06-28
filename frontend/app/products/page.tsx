"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  storeName: string;
}

const DUMMY_PRODUCTS: Product[] = [
  { id: "1", name: "Laptop Asus ROG", description: "Laptop gaming berspesifikasi tinggi dengan Intel Core i7 dan Nvidia RTX 4060.", price: 15000000, storeName: "Toko Asus Official" },
  { id: "2", name: "Keyboard Mechanical Razer", description: "Keyboard Razer Blackwidow dengan switch linear kuning yang sunyi.", price: 1500000, storeName: "Razer Store" },
  { id: "3", name: "Mouse Logitech G Pro", description: "Mouse wireless superlight untuk kebutuhan gaming e-sports.", price: 1200000, storeName: "Logitech Official" },
  { id: "4", name: "Monitor Samsung 24\"", description: "Monitor IPS 24 inch dengan refresh rate 75Hz dan desain borderless.", price: 1800000, storeName: "Samsung Store" },
  { id: "5", name: "Headset SteelSeries", description: "Headset gaming dengan suara high-fidelity dan mikrofon jernih.", price: 1600000, storeName: "SteelSeries Official" },
  { id: "6", name: "RAM Corsair 16GB", description: "RAM DDR4 Vengeance LPX 3200MHz untuk kecepatan multitasking.", price: 950000, storeName: "Corsair Store Indonesia" },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = DUMMY_PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Katalog Produk</h1>
          <p className="text-zinc-500 font-light mt-1">Temukan berbagai produk berkualitas dari mitra penjual terpercaya kami.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Cari nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-zinc-200 bg-white"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
          <p className="text-zinc-400 font-light">Tidak ada produk yang cocok dengan pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const initials = product.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <Card key={product.id} className="border border-zinc-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
                <div>
                  {/* Gray Box Image Placeholder */}
                  <div className="h-48 bg-zinc-100 flex items-center justify-center border-b border-zinc-200">
                    <span className="text-3xl font-bold text-zinc-400 tracking-wider">{initials}</span>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg font-bold text-zinc-900">{product.name}</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-zinc-400">{product.storeName}</CardDescription>
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
