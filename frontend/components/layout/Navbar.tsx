"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getUser, clearAuth, isLoggedIn } from "@/lib/auth";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) {
      setUser(getUser());
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      clearAuth();
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  if (!mounted) return null;

  const roleColors: Record<string, string> = {
    BUYER: "bg-blue-500 hover:bg-blue-600 text-white",
    SELLER: "bg-green-500 hover:bg-green-600 text-white",
    DRIVER: "bg-orange-500 hover:bg-orange-600 text-white",
    ADMIN: "bg-red-500 hover:bg-red-600 text-white",
  };

  const dashboardPath = user?.activeRole
    ? `/${user.activeRole.toLowerCase()}/dashboard`
    : "/auth/select-role";

  return (
    <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-zinc-900" />
              <span>SEAPEDIA</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-zinc-600 hover:text-zinc-950 transition font-medium">Home</Link>
            <Link href="/products" className="text-zinc-600 hover:text-zinc-950 transition font-medium">Products</Link>
          </div>

          {/* Right Side Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-800 text-sm">{user.username}</span>
                  {user.activeRole && (
                    <Badge className={`${roleColors[user.activeRole]} capitalize border-0`}>
                      {user.activeRole.toLowerCase()}
                    </Badge>
                  )}
                </div>
                <Link
                  href={dashboardPath}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1.5")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className={cn(buttonVariants({ size: "sm" }), "bg-zinc-950 hover:bg-zinc-800 text-white")}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="text-zinc-800" />}>
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-8">
                  <Link href="/" className="text-lg font-medium text-zinc-800 hover:text-zinc-950">Home</Link>
                  <Link href="/products" className="text-lg font-medium text-zinc-800 hover:text-zinc-950">Products</Link>
                  <div className="border-t border-zinc-100 pt-6 flex flex-col space-y-4">
                    {user ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-800">{user.username}</span>
                          {user.activeRole && (
                            <Badge className={roleColors[user.activeRole]}>
                              {user.activeRole}
                            </Badge>
                          )}
                        </div>
                        <Link
                          href={dashboardPath}
                          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start flex items-center")}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                        <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className={cn(buttonVariants({ variant: "outline" }), "w-full text-center block")}
                        >
                          Login
                        </Link>
                        <Link
                          href="/auth/register"
                          className={cn(buttonVariants(), "w-full bg-zinc-950 hover:bg-zinc-800 text-white text-center block")}
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
