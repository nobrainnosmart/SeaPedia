"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Home, Wallet, MapPin, ShoppingCart, ShoppingBag, 
  BarChart2, Store, Users, Percent, Truck, Clock, 
  ChevronRight, RefreshCw, LogOut, Menu 
} from "lucide-react";
import { getUser, clearAuth } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  const activeRole = user?.activeRole;

  const handleLogout = () => {
    clearAuth();
    router.push("/auth/login");
  };

  const getSidebarItems = (role: string): SidebarItem[] => {
    switch (role) {
      case "BUYER":
        return [
          { label: "Beranda", href: "/buyer/dashboard", icon: Home },
          { label: "Dompet", href: "/buyer/wallet", icon: Wallet },
          { label: "Alamat", href: "/buyer/addresses", icon: MapPin },
          { label: "Keranjang", href: "/buyer/cart", icon: ShoppingCart },
          { label: "Pesanan", href: "/buyer/orders", icon: ShoppingBag },
          { label: "Laporan", href: "/buyer/reports", icon: BarChart2 },
        ];
      case "SELLER":
        return [
          { label: "Beranda", href: "/seller/dashboard", icon: Home },
          { label: "Toko Saya", href: "/seller/store", icon: Store },
          { label: "Produk", href: "/seller/products", icon: ShoppingBag },
          { label: "Pesanan", href: "/seller/orders", icon: ShoppingCart },
          { label: "Voucher", href: "/seller/vouchers", icon: Percent },
          { label: "Laporan", href: "/seller/reports", icon: BarChart2 },
        ];
      case "DRIVER":
        return [
          { label: "Beranda", href: "/driver/dashboard", icon: Home },
          { label: "Cari Pekerjaan", href: "/driver/jobs", icon: Truck },
          { label: "Pekerjaan Saya", href: "/driver/history", icon: ShoppingBag },
          { label: "Penghasilan", href: "/driver/earnings", icon: Wallet },
        ];
      case "ADMIN":
        return [
          { label: "Beranda", href: "/admin/dashboard", icon: Home },
          { label: "Pengguna", href: "/admin/users", icon: Users },
          { label: "Toko", href: "/admin/stores", icon: Store },
          { label: "Produk", href: "/admin/products", icon: ShoppingBag },
          { label: "Pesanan", href: "/admin/orders", icon: ShoppingCart },
          { label: "Diskon", href: "/admin/vouchers", icon: Percent },
          { label: "Pengiriman", href: "/admin/delivery-jobs", icon: Truck },
          { label: "Pesanan Terlambat", href: "/admin/overdue", icon: Clock },
          { label: "Simulasi Waktu", href: "/admin/time-simulation", icon: RefreshCw },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = activeRole ? getSidebarItems(activeRole) : [];

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-zinc-50">
      {/* Mobile Sticky Top Header */}
      <div className="flex md:hidden h-14 bg-white border-b border-zinc-200 px-6 items-center justify-between sticky top-16 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-700 hover:text-zinc-950 rounded-lg hover:bg-zinc-100" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-white p-6 flex flex-col justify-between">
              <div>
                {/* User info */}
                <div className="mb-6">
                  <h3 className="font-bold text-zinc-950 text-base">{user.username}</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">{user.email}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-600/10 capitalize">
                      {activeRole?.toLowerCase()}
                    </span>
                    {user.roles && user.roles.length > 1 && (
                      <Link
                        href="/auth/select-role"
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-6 px-1.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-1")}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Ganti
                      </Link>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Nav items */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? "bg-zinc-950 text-white"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}
                      >
                        <Icon className={`mr-3 h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-700"}`} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="h-4 w-4 animate-pulse" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Footer actions */}
              <div>
                <Button variant="outline" onClick={handleLogout} className="w-full text-zinc-600 hover:text-zinc-950 flex items-center justify-center gap-2 border-zinc-200 rounded-xl">
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-bold text-zinc-950 text-sm">Dashboard</span>
        </div>
        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-600/10 capitalize">
          {activeRole?.toLowerCase()}
        </span>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col justify-between py-6 shrink-0">
        <div>
          {/* User info */}
          <div className="px-6 mb-6">
            <h3 className="font-bold text-zinc-950 text-base">{user.username}</h3>
            <p className="text-zinc-500 text-xs mt-0.5">{user.email}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-600/10 capitalize">
                {activeRole?.toLowerCase()}
              </span>
              {user.roles && user.roles.length > 1 && (
                <Link
                  href="/auth/select-role"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-6 px-1.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-1")}
                >
                  <RefreshCw className="h-3 w-3" />
                  Ganti
                </Link>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Nav items */}
          <nav className="space-y-1 px-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Icon className={`mr-3 h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-700"}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="px-4">
          <Button variant="outline" onClick={handleLogout} className="w-full text-zinc-600 hover:text-zinc-950 flex items-center justify-center gap-2 border-zinc-200 rounded-xl">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
