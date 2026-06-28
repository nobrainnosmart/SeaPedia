"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { KeyRound, Mail, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { setAuth } from "@/lib/auth";
import api from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(1, { message: "Kata sandi wajib diisi" }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      const { token, user, requiresRoleSelection } = res.data;

      setAuth(token, user);
      toast.success(`Selamat datang kembali, ${user.username}!`);

      if (requiresRoleSelection) {
        router.push("/auth/select-role");
      } else {
        const active = user.activeRole || user.roles[0];
        setAuth(token, { ...user, activeRole: active });
        router.push(`/${active.toLowerCase()}/dashboard`);
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal masuk. Silakan cek kredensial Anda.");
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
          <CardTitle className="text-xl font-bold text-zinc-900">Masuk ke Akun Anda</CardTitle>
          <CardDescription className="text-zinc-500 font-light">Masukkan kredensial Anda untuk masuk ke platform.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-zinc-100 pt-6 mt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg"
            >
              {loading ? "Masuk..." : "Masuk"}
            </Button>
            <p className="text-sm text-center text-zinc-500 font-light">
              Belum punya akun?{" "}
              <Link href="/auth/register" className="text-zinc-950 font-semibold hover:underline">
                Daftar Sekarang
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
