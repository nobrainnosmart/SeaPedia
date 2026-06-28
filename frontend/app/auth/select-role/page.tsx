"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, User, Truck, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getUser, setAuth, getToken } from "@/lib/auth";
import api from "@/lib/api";

export default function SelectRolePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const activeUser = getUser();
    if (!activeUser) {
      router.push("/auth/login");
    } else {
      setUser(activeUser);
    }
  }, [router]);

  const selectRole = async (role: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/select-role", { role });
      const { token, activeRole } = res.data;

      const tokenStr = token || getToken();
      setAuth(tokenStr, { ...user, activeRole });

      toast.success(`Berhasil memilih peran ${activeRole.toLowerCase()}`);
      router.push(`/${activeRole.toLowerCase()}/dashboard`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal mengganti peran.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const roleDetails: Record<string, { title: string; desc: string; icon: any; color: string; border: string }> = {
    BUYER: {
      title: "Pembeli (Buyer)",
      desc: "Belanja produk kebutuhan harian, kelola dompet, dan track pesanan Anda.",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
      border: "hover:border-blue-300",
    },
    SELLER: {
      title: "Penjual (Seller)",
      desc: "Buka toko Anda, posting produk, kelola transaksi, dan pantau keuangan toko.",
      icon: User,
      color: "bg-green-50 text-green-600",
      border: "hover:border-green-300",
    },
    DRIVER: {
      title: "Pengemudi (Driver)",
      desc: "Temukan pekerjaan pengiriman barang dan peroleh pendapatan tambahan.",
      icon: Truck,
      color: "bg-orange-50 text-orange-600",
      border: "hover:border-orange-300",
    },
    ADMIN: {
      title: "Administrator",
      desc: "Akses panel admin untuk memantau sistem secara keseluruhan.",
      icon: ShieldAlert,
      color: "bg-red-50 text-red-600",
      border: "hover:border-red-300",
    },
  };

  return (
    <div className="flex flex-1 items-center justify-center py-16 px-4 bg-zinc-50">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">
          Halo, {user.username}!
        </h1>
        <p className="text-zinc-500 font-light mb-8 max-w-md mx-auto">
          Silakan pilih salah satu peran Anda untuk melanjutkan ke dashboard yang sesuai.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
          {user.roles.map((role: string) => {
            const detail = roleDetails[role];
            if (!detail) return null;
            const Icon = detail.icon;

            return (
              <Card
                key={role}
                onClick={() => !loading && selectRole(role)}
                className={`border border-zinc-200 bg-white rounded-2xl p-6 text-left cursor-pointer transition shadow-sm hover:shadow ${detail.border} ${loading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <CardHeader className="p-0 flex flex-row items-center gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${detail.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-zinc-900 leading-tight">
                      {detail.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">
                    {detail.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
