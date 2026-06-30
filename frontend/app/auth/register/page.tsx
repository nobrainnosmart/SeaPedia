"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { KeyRound, Mail, User, ShoppingBag, Store, Truck, AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { setAuth } from "@/lib/auth";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username minimal 3 karakter" }).max(30),
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter" }),
  confirmPassword: z.string(),
  roles: z.array(z.enum(["BUYER", "SELLER", "DRIVER"])).min(1, { message: "Pilih minimal 1 peran" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      roles: [],
    },
  });

  const watchedRoles = watch("roles") || [];

  const handleRoleToggle = (role: "BUYER" | "SELLER" | "DRIVER") => {
    if (watchedRoles.includes(role)) {
      setValue("roles", watchedRoles.filter((r) => r !== role));
    } else {
      setValue("roles", [...watchedRoles, role]);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setServerError(null);
    try {
      // 1. Register User
      await api.post("/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
        roles: data.roles,
      });

      toast.success("Registrasi berhasil! Melakukan login otomatis...");

      // 2. Auto Login
      const loginRes = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { token, user, requiresRoleSelection } = loginRes.data;
      setAuth(token, user);

      if (requiresRoleSelection) {
        router.push("/auth/select-role");
      } else {
        const active = user.activeRole || user.roles[0];
        setAuth(token, { ...user, activeRole: active });
        router.push(`/${active.toLowerCase()}/dashboard`);
      }
      router.refresh();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Gagal melakukan registrasi.";
      setServerError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex flex-1 items-center justify-center py-16 px-4 bg-sea-foam"
      style={{
        backgroundImage: "repeating-linear-gradient(45deg, rgba(11,61,68,0.01) 0px, rgba(11,61,68,0.01) 2px, transparent 2px, transparent 12px)",
      }}
    >
      <Card className="w-full max-w-md border border-line bg-white rounded-default shadow-card">
        <CardHeader className="text-center pb-4 space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <rect x="2" y="6" width="16" height="12" rx="2" fill="#E8923C" />
              <rect x="10" y="10" width="16" height="12" rx="2" fill="#0B3D44" stroke="#D7E4E2" strokeWidth="2" />
            </svg>
            <span className="text-xl font-display font-bold tracking-tight text-sea-deep">SEAPEDIA</span>
          </Link>
          <CardTitle className="text-lg font-bold text-manifest-ink font-display">Buat Akun Baru</CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-light">Mulai langkah Anda sebagai Pembeli, Penjual, atau Driver.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="p-3 bg-tide-coral/10 border border-tide-coral/20 rounded-lg text-xs text-tide-coral flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="john_doe"
                  {...register("username")}
                  className="pl-9 rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid focus-visible:border-transparent"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-tide-coral">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className="pl-9 rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid focus-visible:border-transparent"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-tide-coral">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-9 rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid focus-visible:border-transparent"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-tide-coral">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="pl-9 rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid focus-visible:border-transparent"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-tide-coral">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Pilih Peran Akun (Pilih minimal 1)
              </label>
              
              <div className="grid grid-cols-1 gap-2.5 mt-1.5">
                {/* BUYER CARD */}
                <div
                  onClick={() => handleRoleToggle("BUYER")}
                  className={cn(
                    "border rounded-lg p-3 flex items-center justify-between cursor-pointer transition relative hover:bg-sea-foam/10",
                    watchedRoles.includes("BUYER") 
                      ? "border-role-buyer bg-role-buyer/5" 
                      : "border-line bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded flex items-center justify-center border transition",
                      watchedRoles.includes("BUYER") 
                        ? "bg-role-buyer text-white border-role-buyer" 
                        : "bg-sea-foam text-muted-foreground border-line"
                    )}>
                      <ShoppingBag className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-manifest-ink">Pembeli (Buyer)</h5>
                      <p className="text-[9px] text-muted-foreground font-light">Belanja kebutuhan cargo & warung</p>
                    </div>
                  </div>
                  {watchedRoles.includes("BUYER") && (
                    <span className="h-4.5 w-4.5 rounded-full bg-role-buyer text-white flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>

                {/* SELLER CARD */}
                <div
                  onClick={() => handleRoleToggle("SELLER")}
                  className={cn(
                    "border rounded-lg p-3 flex items-center justify-between cursor-pointer transition relative hover:bg-role-seller/5",
                    watchedRoles.includes("SELLER") 
                      ? "border-role-seller bg-role-seller/5" 
                      : "border-line bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded flex items-center justify-center border transition",
                      watchedRoles.includes("SELLER") 
                        ? "bg-role-seller text-white border-role-seller" 
                        : "bg-sea-foam text-muted-foreground border-line"
                    )}>
                      <Store className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-manifest-ink">Penjual (Seller)</h5>
                      <p className="text-[9px] text-muted-foreground font-light">Buka warung, kelola inventori & stok</p>
                    </div>
                  </div>
                  {watchedRoles.includes("SELLER") && (
                    <span className="h-4.5 w-4.5 rounded-full bg-role-seller text-white flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>

                {/* DRIVER CARD */}
                <div
                  onClick={() => handleRoleToggle("DRIVER")}
                  className={cn(
                    "border rounded-lg p-3 flex items-center justify-between cursor-pointer transition relative hover:bg-role-driver/5",
                    watchedRoles.includes("DRIVER") 
                      ? "border-role-driver bg-role-driver/5" 
                      : "border-line bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded flex items-center justify-center border transition",
                      watchedRoles.includes("DRIVER") 
                        ? "bg-role-driver text-white border-role-driver" 
                        : "bg-sea-foam text-muted-foreground border-line"
                    )}>
                      <Truck className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-manifest-ink">Driver</h5>
                      <p className="text-[9px] text-muted-foreground font-light">Ambil pesanan & kirim kargo</p>
                    </div>
                  </div>
                  {watchedRoles.includes("DRIVER") && (
                    <span className="h-4.5 w-4.5 rounded-full bg-role-driver text-white flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>

              {errors.roles && (
                <p className="mt-1 text-xs text-tide-coral">{errors.roles.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-line pt-6 mt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg h-10 text-xs font-bold border-0 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <span>Daftar</span>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground font-light">
              Sudah memiliki akun?{" "}
              <Link href="/auth/login" className="text-sea-mid font-semibold hover:underline">
                Masuk Disini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
