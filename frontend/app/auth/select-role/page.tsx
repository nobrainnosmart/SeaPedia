"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Store, Truck, ShieldAlert, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getUser, setAuth, getToken } from "@/lib/auth";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import RoleBadge from "@/components/ui/RoleBadge";

export default function SelectRolePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectingRole, setSelectingRole] = useState<string | null>(null);

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
    setSelectingRole(role);
    try {
      const res = await api.post("/auth/select-role", { role });
      const { token, activeRole } = res.data;

      const tokenStr = token || getToken();
      setAuth(tokenStr || "", { ...user, activeRole });

      toast.success(`Berhasil memilih peran ${activeRole.toLowerCase()}`);
      router.push(`/${activeRole.toLowerCase()}/dashboard`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal mengganti peran.");
    } finally {
      setLoading(false);
      setSelectingRole(null);
    }
  };

  if (!user) return null;

  const roleDetails: Record<string, { title: string; desc: string; icon: any; color: string; hoverBorder: string; activeBorder: string }> = {
    BUYER: {
      title: "Pembeli (Buyer)",
      desc: "Belanja produk kebutuhan harian, kelola dompet, dan track pesanan Anda.",
      icon: ShoppingBag,
      color: "bg-role-buyer/10 text-role-buyer border-role-buyer/20",
      hoverBorder: "hover:border-role-buyer/40",
      activeBorder: "border-role-buyer shadow-md bg-role-buyer/5",
    },
    SELLER: {
      title: "Penjual (Seller)",
      desc: "Buka toko Anda, posting produk, kelola transaksi, dan pantau keuangan toko.",
      icon: Store,
      color: "bg-role-seller/10 text-role-seller border-role-seller/20",
      hoverBorder: "hover:border-role-seller/40",
      activeBorder: "border-role-seller shadow-md bg-role-seller/5",
    },
    DRIVER: {
      title: "Pengemudi (Driver)",
      desc: "Temukan pekerjaan pengiriman barang dan peroleh pendapatan tambahan.",
      icon: Truck,
      color: "bg-role-driver/10 text-role-driver border-role-driver/20",
      hoverBorder: "hover:border-role-driver/40",
      activeBorder: "border-role-driver shadow-md bg-role-driver/5",
    },
    ADMIN: {
      title: "Administrator",
      desc: "Akses panel admin untuk memantau sistem secara keseluruhan.",
      icon: ShieldAlert,
      color: "bg-role-admin/10 text-role-admin border-role-admin/20",
      hoverBorder: "hover:border-role-admin/40",
      activeBorder: "border-role-admin shadow-md bg-role-admin/5",
    },
  };

  return (
    <div 
      className="flex flex-1 items-center justify-center py-16 px-4 bg-sea-foam"
      style={{
        backgroundImage: "repeating-linear-gradient(45deg, rgba(11,61,68,0.01) 0px, rgba(11,61,68,0.01) 2px, transparent 2px, transparent 12px)",
      }}
    >
      <div className="w-full max-w-2xl text-center space-y-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sea-mid">Otentikasi Peran</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-manifest-ink font-display mt-1">
            Pilih Peran Aktif
          </h1>
          <p className="text-muted-foreground font-light text-xs max-w-md mx-auto mt-1.5">
            Anda memiliki beberapa peran terdaftar. Pilih salah satu peran di bawah untuk melanjutkan ke dashboard operasional Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
          {user.roles.map((role: string) => {
            const detail = roleDetails[role];
            if (!detail) return null;
            const Icon = detail.icon;
            const isSelectingThis = selectingRole === role;

            return (
              <Card
                key={role}
                onClick={() => !loading && selectRole(role)}
                className={cn(
                  "border bg-white rounded-default p-6 text-left cursor-pointer transition-all duration-300 relative select-none",
                  isSelectingThis ? detail.activeBorder : "border-line shadow-card hover:shadow-lift",
                  detail.hoverBorder,
                  loading && !isSelectingThis ? "opacity-50 pointer-events-none" : "",
                  isSelectingThis ? "scale-[1.01]" : "hover:scale-[1.01]"
                )}
              >
                <CardHeader className="p-0 flex flex-row items-center gap-4 mb-4">
                  <div className={`h-11 w-11 rounded-lg flex items-center justify-center border transition ${detail.color}`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-bold text-manifest-ink leading-tight font-display">
                      {detail.title}
                    </CardTitle>
                    <div className="mt-1">
                      <RoleBadge role={role} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    {detail.desc}
                  </p>
                  
                  {isSelectingThis && (
                    <div className="absolute right-4 bottom-4 flex items-center gap-1 text-[10px] text-sea-mid font-semibold font-mono animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
