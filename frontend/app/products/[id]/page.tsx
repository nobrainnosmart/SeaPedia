"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ShoppingCart, Store, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getUser, isLoggedIn } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  storeName: string;
  stock: number;
}

const DUMMY_PRODUCTS: Product[] = [
  { id: "1", name: "Laptop Asus ROG", description: "Laptop gaming berspesifikasi tinggi dengan Intel Core i7 dan Nvidia RTX 4060.", price: 15000000, storeName: "Toko Asus Official", stock: 10 },
  { id: "2", name: "Keyboard Mechanical Razer", description: "Keyboard Razer Blackwidow dengan switch linear kuning yang sunyi.", price: 1500000, storeName: "Razer Store", stock: 15 },
  { id: "3", name: "Mouse Logitech G Pro", description: "Mouse wireless superlight untuk kebutuhan gaming e-sports.", price: 1200000, storeName: "Logitech Official", stock: 20 },
  { id: "4", name: "Monitor Samsung 24\"", description: "Monitor IPS 24 inch dengan refresh rate 75Hz dan desain borderless.", price: 1800000, storeName: "Samsung Store", stock: 8 },
  { id: "5", name: "Headset SteelSeries", description: "Headset gaming dengan suara high-fidelity dan mikrofon jernih.", price: 1600000, storeName: "SteelSeries Official", stock: 12 },
  { id: "6", name: "RAM Corsair 16GB", description: "RAM DDR4 Vengeance LPX 3200MHz untuk kecepatan multitasking.", price: 950000, storeName: "Corsair Store Indonesia", stock: 25 },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(isLoggedIn() ? getUser() : null);
    const found = DUMMY_PRODUCTS.find((p) => p.id === params.id);
    if (found) {
      setProduct(found);
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-500 font-light">Produk tidak ditemukan.</p>
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

  const handleAddToCart = () => {
    toast.success(`${product.name} ditambahkan ke keranjang!`);
  };

  const isBuyer = user?.activeRole === "BUYER";

  const initials = product.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Placeholder */}
        <div className="h-96 bg-zinc-100 rounded-3xl flex items-center justify-center border border-zinc-200">
          <span className="text-6xl font-bold text-zinc-300 tracking-wider">{initials}</span>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <Store className="h-4 w-4 text-zinc-400" />
              <span>{product.storeName}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight mb-4">{product.name}</h1>
            <p className="text-2xl font-bold text-zinc-900 mb-6">
              Rp {product.price.toLocaleString("id-ID")}
            </p>

            <div className="border-t border-b border-zinc-200 py-6 my-6">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Deskripsi Produk</h3>
              <p className="text-zinc-600 text-sm font-light leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-zinc-500 mb-6">
              <span>Status Stok</span>
              <span className="font-semibold text-zinc-800">{product.stock} unit tersedia</span>
            </div>
          </div>

          {/* Action Area */}
          <Card className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-sm mt-6">
            <CardContent className="p-0 flex flex-col gap-4">
              {isBuyer ? (
                <Button onClick={handleAddToCart} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl py-6 flex items-center justify-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Tambah ke Keranjang
                </Button>
              ) : (
                <div className="text-center py-2">
                  <p className="text-zinc-500 text-sm font-light mb-4">
                    {user 
                      ? `Anda terdaftar sebagai ${user.activeRole?.toLowerCase()}. Gunakan peran pembeli untuk membeli.`
                      : "Silakan masuk dengan peran pembeli untuk berbelanja di platform ini."}
                  </p>
                  <Link
                    href={user ? "/auth/select-role" : "/auth/login"}
                    className={cn(buttonVariants(), "w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-center block")}
                  >
                    {user ? "Pilih Peran Pembeli" : "Masuk sebagai Pembeli"}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
