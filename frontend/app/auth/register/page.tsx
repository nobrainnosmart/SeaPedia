"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { KeyRound, Mail, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { setAuth } from "@/lib/auth";
import api from "@/lib/api";

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

  const handleRoleChange = (role: "BUYER" | "SELLER" | "DRIVER", checked: boolean) => {
    if (checked) {
      setValue("roles", [...watchedRoles, role]);
    } else {
      setValue("roles", watchedRoles.filter((r) => r !== role));
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
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
      toast.error(err.response?.data?.error || "Gagal melakukan registrasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-16 px-4 bg-zinc-50">
      <Card className="w-full max-w-md border border-zinc-200 bg-white rounded-2xl shadow-sm">
        <CardHeader className="text-center pb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-950 mb-3 justify-center">
            <ShoppingBag className="h-6 w-6 text-zinc-900" />
            <span>SEAPEDIA</span>
          </Link>
          <CardTitle className="text-xl font-bold text-zinc-900">Buat Akun Baru</CardTitle>
          <CardDescription className="text-zinc-500 font-light">Mulai langkah Anda sebagai Pembeli, Penjual, atau Pengemudi.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="john_doe"
                  {...register("username")}
                  className="pl-10 rounded-lg border-zinc-200 bg-white"
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className="pl-10 rounded-lg border-zinc-200 bg-white"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-10 rounded-lg border-zinc-200 bg-white"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="pl-10 rounded-lg border-zinc-200 bg-white"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Pilih Peran Akun (Pilih minimal 1)
              </label>
              <div className="space-y-2 mt-2">
                {["BUYER", "SELLER", "DRIVER"].map((role) => (
                  <label key={role} className="flex items-center space-x-3 cursor-pointer text-sm font-medium text-zinc-700 bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-150 hover:bg-zinc-50 transition-colors">
                    <input
                      type="checkbox"
                      value={role}
                      checked={watchedRoles.includes(role as any)}
                      onChange={(e) => handleRoleChange(role as any, e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer"
                    />
                    <span className="capitalize">{role.toLowerCase()}</span>
                  </label>
                ))}
              </div>
              {errors.roles && (
                <p className="mt-1.5 text-xs text-red-600">{errors.roles.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-zinc-100 pt-6 mt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg"
            >
              {loading ? "Mendaftar..." : "Daftar"}
            </Button>
            <p className="text-sm text-center text-zinc-500 font-light">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="text-zinc-950 font-semibold hover:underline">
                Masuk Disini
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
