"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { KeyRound, Mail, AlertCircle, Loader2 } from "lucide-react";
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
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setServerError(null);
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
      const errMsg = err.response?.data?.error || "Gagal masuk. Silakan cek kredensial Anda.";
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
          <CardTitle className="text-lg font-bold text-manifest-ink font-display">Masuk ke Akun</CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-light">Masukkan email dan sandi manifest Anda.</CardDescription>
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
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground font-light">
              Belum memiliki akun?{" "}
              <Link href="/auth/register" className="text-sea-mid font-semibold hover:underline">
                Daftar Sekarang
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
