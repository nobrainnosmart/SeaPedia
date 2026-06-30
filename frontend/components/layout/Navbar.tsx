"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Menu, X, LogOut, LayoutDashboard, ShoppingBag, ShoppingCart, RefreshCw, ChevronDown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getUser, clearAuth, isLoggedIn, setAuth, getToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import RoleBadge from "@/components/ui/RoleBadge";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showRolePopover, setShowRolePopover] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const rolePopoverRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) {
      setUser(getUser());
    } else {
      setUser(null);
    }
  }, [pathname]);

  // Scroll listener for sticky shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 8) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rolePopoverRef.current && !rolePopoverRef.current.contains(event.target as Node)) {
        setShowRolePopover(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      clearAuth();
      setUser(null);
      setShowUserDropdown(false);
      toast.success("Berhasil keluar dari akun");
      router.push("/");
      router.refresh();
    }
  };

  const handleSwitchRole = async (role: string) => {
    try {
      const res = await api.post("/auth/select-role", { role });
      const { token, activeRole } = res.data;
      const currentToken = token || getToken();
      setAuth(currentToken || "", { ...user, activeRole });
      toast.success(`Berhasil beralih ke peran ${activeRole.toLowerCase()}`);
      setShowRolePopover(false);
      router.push(`/${activeRole.toLowerCase()}/dashboard`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal mengganti peran.");
    }
  };

  if (!mounted) return null;

  const dashboardPath = user?.activeRole
    ? `/${user.activeRole.toLowerCase()}/dashboard`
    : "/auth/select-role";

  // Initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "";
    return name.slice(0, 2).toUpperCase();
  };

  // Role accent classes for avatar
  const roleBgClass = (role: string) => {
    switch (role) {
      case "BUYER": return "bg-role-buyer text-white";
      case "SELLER": return "bg-role-seller text-white";
      case "DRIVER": return "bg-role-driver text-white";
      case "ADMIN": return "bg-role-admin text-white";
      default: return "bg-sea-mid text-white";
    }
  };

  const isLinkActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav
      className={cn(
        "bg-sea-deep text-white sticky top-0 z-50 transition-all duration-200 border-b border-white/10",
        isScrolled ? "shadow-card py-2 bg-sea-deep/95 backdrop-blur-md" : "py-3"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Left Wordmark + custom SVG Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              {/* Custom SVG mark representing connected store/cargo */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <rect x="2" y="6" width="16" height="12" rx="2" fill="#E8923C" />
                <rect x="10" y="10" width="16" height="12" rx="2" fill="white" stroke="#0B3D44" strokeWidth="2" />
              </svg>
              <span className="text-xl font-display font-bold tracking-tight text-white">
                SEAPEDIA
              </span>
            </Link>
          </div>

          {/* Center (Desktop only) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={cn(
                "relative text-sm font-medium tracking-wide transition-colors py-1.5",
                isLinkActive("/") ? "text-cargo-amber font-semibold" : "text-white/80 hover:text-white"
              )}
            >
              Beranda
              {isLinkActive("/") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cargo-amber rounded-full" />
              )}
            </Link>
            <Link
              href="/products"
              className={cn(
                "relative text-sm font-medium tracking-wide transition-colors py-1.5",
                isLinkActive("/products") ? "text-cargo-amber font-semibold" : "text-white/80 hover:text-white"
              )}
            >
              Produk
              {isLinkActive("/products") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cargo-amber rounded-full" />
              )}
            </Link>
            <Link
              href="/#apa-kata-mereka"
              className="relative text-sm font-medium tracking-wide transition-colors py-1.5 text-white/80 hover:text-white"
            >
              Ulasan
            </Link>
          </div>

          {/* Right side controls */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Cart link only for BUYER role */}
                {user.activeRole === "BUYER" && (
                  <Link
                    href="/buyer/cart"
                    className="flex items-center gap-1.5 text-white/80 hover:text-white transition py-1.5 px-3 rounded-full hover:bg-white/10"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                    <span className="text-xs font-semibold">Keranjang</span>
                  </Link>
                )}

                {/* Role Switcher Popover */}
                <div className="relative" ref={rolePopoverRef}>
                  <div className="flex items-center gap-1.5">
                    <RoleBadge role={user.activeRole} />
                    {user.roles && user.roles.length > 1 && (
                      <button
                        onClick={() => setShowRolePopover(!showRolePopover)}
                        className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10 flex items-center transition"
                        title="Ganti Peran"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {showRolePopover && (
                    <div className="absolute right-0 mt-2.5 w-48 bg-white border border-line rounded-default shadow-lift text-manifest-ink py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1.5 border-b border-line mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pilih Peran Aktif</span>
                      </div>
                      {user.roles.map((r: string) => (
                        <button
                          key={r}
                          onClick={() => handleSwitchRole(r)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs hover:bg-sea-foam transition flex items-center justify-between",
                            r === user.activeRole && "font-semibold text-sea-mid bg-sea-foam/50"
                          )}
                        >
                          <span className="capitalize">{r.toLowerCase()}</span>
                          {r === user.activeRole && <span className="h-1.5 w-1.5 rounded-full bg-sea-mid" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Avatar and Dropdown Menu */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 focus:outline-none group"
                  >
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner cursor-pointer border border-white/20 transition group-hover:scale-105", roleBgClass(user.activeRole))}>
                      {getInitials(user.username)}
                    </div>
                    <span className="font-body font-medium text-sm text-white/95 group-hover:text-white transition">
                      {user.username}
                    </span>
                    <ChevronDown className="h-4 w-4 text-white/65 group-hover:text-white transition" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2.5 w-48 bg-white border border-line rounded-default shadow-lift text-manifest-ink py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3 py-1.5 border-b border-line mb-1">
                        <span className="text-[10px] text-muted-foreground block truncate">{user.email}</span>
                      </div>
                      <Link
                        href={dashboardPath}
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-sea-foam transition flex items-center gap-2"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-tide-coral/10 text-tide-coral transition flex items-center gap-2 border-t border-line mt-1"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-white hover:text-white hover:bg-white/10 font-semibold"
                  )}
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-cargo-amber hover:bg-cargo-amber/90 text-white font-bold px-4 border-0 shadow-sm"
                  )}
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger 
                render={
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/15">
                    <Menu className="h-6 w-6" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-[280px] bg-sea-deep text-white border-white/10 p-6 flex flex-col justify-between">
                <div className="space-y-6 mt-8">
                  {/* Brand info on mobile */}
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="6" width="16" height="12" rx="2" fill="#E8923C" />
                      <rect x="10" y="10" width="16" height="12" rx="2" fill="white" stroke="#0B3D44" strokeWidth="2" />
                    </svg>
                    <span className="text-lg font-display font-bold tracking-tight">SEAPEDIA</span>
                  </div>

                  <div className="flex flex-col space-y-4">
                    <Link href="/" className="text-sm font-medium text-white/80 hover:text-white py-1">Beranda</Link>
                    <Link href="/products" className="text-sm font-medium text-white/80 hover:text-white py-1">Produk</Link>
                    <Link href="/#apa-kata-mereka" className="text-sm font-medium text-white/80 hover:text-white py-1">Ulasan</Link>
                  </div>

                  <div className="border-t border-white/10 pt-6 flex flex-col space-y-4">
                    {user ? (
                      <>
                        <div className="flex flex-col gap-1 bg-white/5 p-3 rounded-lg border border-white/5">
                          <span className="font-semibold text-sm">{user.username}</span>
                          <span className="text-[11px] text-white/60 truncate">{user.email}</span>
                          <div className="mt-2.5 flex items-center justify-between">
                            <RoleBadge role={user.activeRole} />
                          </div>
                        </div>

                        {user.activeRole === "BUYER" && (
                          <Link
                            href="/buyer/cart"
                            className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-white border-white/20 hover:bg-white/10 hover:text-white")}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Keranjang
                          </Link>
                        )}

                        {user.roles && user.roles.length > 1 && (
                          <div className="space-y-1">
                            <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold block mb-1">Ganti Peran</span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {user.roles.map((r: string) => (
                                <Button
                                  key={r}
                                  variant="outline"
                                  size="xs"
                                  onClick={() => handleSwitchRole(r)}
                                  className={cn(
                                    "text-white border-white/10 hover:bg-white/10 capitalize justify-center h-8 text-[11px]",
                                    r === user.activeRole && "bg-white/15 border-cargo-amber/40 text-cargo-amber"
                                  )}
                                >
                                  {r.toLowerCase()}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        <Link
                          href={dashboardPath}
                          className={cn(buttonVariants(), "w-full bg-cargo-amber hover:bg-cargo-amber/90 text-white font-semibold")}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className={cn(buttonVariants({ variant: "outline" }), "w-full text-center text-white border-white/20 hover:bg-white/10 hover:text-white")}
                        >
                          Masuk
                        </Link>
                        <Link
                          href="/auth/register"
                          className={cn(buttonVariants(), "w-full bg-cargo-amber hover:bg-cargo-amber/90 text-white text-center")}
                        >
                          Daftar
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {user && (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300 mt-auto"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </Button>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
