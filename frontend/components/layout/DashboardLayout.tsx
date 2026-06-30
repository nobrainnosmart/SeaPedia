"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Home, Wallet, MapPin, ShoppingCart, ShoppingBag, 
  BarChart2, Store, Users, Percent, Truck, Clock, 
  RefreshCw, LogOut
} from "lucide-react";
import { getUser, clearAuth } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import RoleBadge from "@/components/ui/RoleBadge";
import { toast } from "sonner";

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
    toast.success("Berhasil keluar dari akun");
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
          { label: "Riwayat", href: "/driver/history", icon: ShoppingBag },
          { label: "Penghasilan", href: "/driver/earnings", icon: Wallet },
        ];
      case "ADMIN":
        return [
          { label: "Beranda", href: "/admin/dashboard", icon: Home },
          { label: "Pengguna", href: "/admin/users", icon: Users },
          { label: "Toko", href: "/admin/stores", icon: Store },
          { label: "Produk", href: "/admin/products", icon: ShoppingBag },
          { label: "Pesanan", href: "/admin/orders", icon: ShoppingCart },
          { label: "Voucher & Promo", href: "/admin/vouchers", icon: Percent },
          { label: "Pengiriman", href: "/admin/delivery-jobs", icon: Truck },
          { label: "Terlambat", href: "/admin/overdue", icon: Clock },
          { label: "Simulasi Waktu", href: "/admin/time-simulation", icon: RefreshCw },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = activeRole ? getSidebarItems(activeRole) : [];

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-sea-foam">
        <p className="text-sea-mid animate-pulse font-medium">Memuat Dashboard...</p>
      </div>
    );
  }

  // Get accent color for current role
  const getRoleAccentColor = (role: string) => {
    switch (role) {
      case "BUYER": return "#137A85"; // sea-mid
      case "SELLER": return "#4C9A6B"; // moss-green
      case "DRIVER": return "#E8923C"; // cargo-amber
      case "ADMIN": return "#6B4C9A"; // indigo
      default: return "#137A85";
    }
  };

  const roleAccentColor = getRoleAccentColor(activeRole);

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-white">
      {/* Desktop Sidebar (240px wide) */}
      <aside className="w-60 bg-white border-r border-line hidden md:flex flex-col justify-between py-6 shrink-0">
        <div>
          {/* Sidebar header with role-accent-colored avatar + user details */}
          <div className="px-5 mb-6 flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner text-white"
              style={{ backgroundColor: roleAccentColor }}
            >
              {getInitials(user.username)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-manifest-ink text-sm truncate">{user.username}</h3>
              <div className="mt-1">
                <RoleBadge role={activeRole} />
              </div>
            </div>
          </div>

          <Separator className="my-4 border-line" />

          {/* Sidebar Nav links */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-4 py-2.5 text-xs font-semibold tracking-wide transition-all border-l-3",
                    isActive
                      ? "text-manifest-ink"
                      : "text-muted-foreground hover:bg-sea-foam/40 hover:text-manifest-ink"
                  )}
                  style={{
                    borderColor: isActive ? roleAccentColor : "transparent",
                    backgroundColor: isActive ? `${roleAccentColor}14` : "transparent",
                  }}
                >
                  <Icon 
                    className="mr-3 h-4.5 w-4.5 shrink-0 transition-colors"
                    style={{
                      color: isActive ? roleAccentColor : `${roleAccentColor}80`,
                    }}
                  />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="px-4">
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="w-full text-xs font-semibold text-muted-foreground hover:text-tide-coral hover:bg-tide-coral/5 flex items-center justify-center gap-2 border-line hover:border-tide-coral/20 rounded-lg h-9"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white min-w-0 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar (fixed at bottom, icons only, small dot indicator) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-line flex justify-around items-center z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-14 h-14 relative"
              title={item.label}
            >
              {isActive && (
                <span
                  className="absolute top-2.5 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: roleAccentColor }}
                />
              )}
              <Icon
                className="h-5.5 w-5.5 transition-colors"
                style={{
                  color: isActive ? roleAccentColor : "#7a8b8d",
                }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
