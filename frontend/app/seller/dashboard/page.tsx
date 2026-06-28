"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, Package, ShoppingBag, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function SellerDashboard() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    api.get("/seller/reports")
      .then(res => setReport(res.data))
      .catch(() => toast.error("Gagal memuat data dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-950">
              Selamat Datang, {user?.username || "Penjual"}! 👋
            </h1>
            <p className="text-zinc-500 text-sm font-light mt-0.5">
              Berikut ringkasan kinerja toko Anda.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-zinc-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm space-y-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl w-fit">
                  <Wallet className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Saldo Dompet</p>
                  <p className="text-xl font-extrabold text-zinc-950 mt-0.5">
                    Rp {(report?.walletBalance || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </Card>

              <Card className="border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm space-y-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl w-fit">
                  <ShoppingBag className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Pendapatan</p>
                  <p className="text-xl font-extrabold text-zinc-950 mt-0.5">
                    Rp {(report?.totalRevenue || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </Card>

              <Card className="border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm space-y-3">
                <div className="p-2.5 bg-blue-50 rounded-xl w-fit">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Produk Aktif</p>
                  <p className="text-xl font-extrabold text-zinc-950 mt-0.5">
                    {report?.productCount || 0} produk
                  </p>
                </div>
              </Card>

              <Card className="border border-zinc-200 bg-white rounded-3xl p-5 shadow-sm space-y-3">
                <div className="p-2.5 bg-amber-50 rounded-xl w-fit">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Pesanan Aktif</p>
                  <p className="text-xl font-extrabold text-zinc-950 mt-0.5">
                    {report?.pendingCount || 0} pesanan
                  </p>
                </div>
              </Card>
            </div>
          )}

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-zinc-500 font-light leading-relaxed">
              Gunakan panel navigasi kiri untuk memperbarui profil Toko, mengelola katalog produk,
              melacak pesanan masuk dari pembeli, membuat voucher diskon, dan menganalisis laporan performa toko Anda.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
