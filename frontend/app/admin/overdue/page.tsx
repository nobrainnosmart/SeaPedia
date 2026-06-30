"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Store, User, ShieldAlert } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import StatusBadge from "@/components/ui/StatusBadge";

export default function AdminOverdueOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [virtualTime, setVirtualTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverdueOrders();
  }, []);

  const fetchOverdueOrders = async () => {
    try {
      const resTime = await api.get("/admin/time-simulation");
      setVirtualTime(new Date(resTime.data.virtualTime));

      const res = await api.get("/admin/overdue");
      setOrders(res.data);
    } catch (err) {
      toast.error("Gagal memuat daftar pesanan terlambat.");
    } finally {
      setLoading(false);
    }
  };

  const getSlaLabel = (method: string) => {
    switch (method) {
      case "INSTANT":
        return "2 Jam";
      case "NEXT_DAY":
        return "24 Jam";
      default:
        return "72 Jam (3 Hari)";
    }
  };

  const calculateLateTime = (createdAtStr: string) => {
    if (!virtualTime) return "-";
    const createdAt = new Date(createdAtStr);
    const diffMs = virtualTime.getTime() - createdAt.getTime();
    
    // deduct SLA limit
    let limitMs = 0;
    const order = orders.find((o) => o.createdAt === createdAtStr);
    if (order) {
      if (order.deliveryMethod === "INSTANT") limitMs = 2 * 60 * 60 * 1000;
      else if (order.deliveryMethod === "NEXT_DAY") limitMs = 24 * 60 * 60 * 1000;
      else limitMs = 72 * 60 * 60 * 1000;
    }

    const lateMs = diffMs - limitMs;
    if (lateMs <= 0) return "Baru Saja Terlambat";

    const lateHours = lateMs / (1000 * 60 * 60);
    if (lateHours < 24) {
      return `Terlambat ${Math.floor(lateHours)} Jam`;
    }
    const lateDays = lateHours / 24;
    return `Terlambat ${Math.floor(lateDays)} Hari ${Math.floor(lateHours % 24)} Jam`;
  };

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Menganalisis SLA Rute...</span>
          </div>
        ) : (
          <div className="space-y-6 text-manifest-ink">
            {/* Header */}
            <div className="border-b border-line pb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-tide-coral">Pengawasan SLA</span>
              <h1 className="text-2xl font-bold font-display mt-0.5">Pesanan Terlambat (SLA Breached)</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">Daftar pesanan aktif yang telah melebihi batas waktu SLA pengantaran berdasarkan simulasi waktu.</p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white border border-line rounded-default shadow-card flex flex-col items-center">
                <div className="p-4 rounded-full bg-role-seller/10 text-role-seller mb-4 border border-role-seller/10">
                  <ShieldAlert className="h-8 w-8 stroke-1" />
                </div>
                <h2 className="text-base font-bold font-display">Operasional Lancar</h2>
                <p className="text-muted-foreground text-xs font-light mt-1">Luar biasa! Tidak ada rute pengiriman yang terlambat saat ini.</p>
              </div>
            ) : (
              <div className="bg-white border border-line rounded-default overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-line bg-sea-foam/15 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="px-5 py-3.5 font-medium">ID Pesanan</th>
                        <th className="px-5 py-3.5 font-medium">Mitra & Pembeli</th>
                        <th className="px-5 py-3.5 font-medium">Metode SLA</th>
                        <th className="px-5 py-3.5 font-medium">Kurir / Status</th>
                        <th className="px-5 py-3.5 font-medium text-tide-coral">Keterlambatan</th>
                        <th className="px-5 py-3.5 font-medium">Waktu Transaksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-xs text-manifest-ink">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-sea-foam/5 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold">#{o.id.slice(-8).toUpperCase()}</td>
                          <td className="px-5 py-3.5">
                            <div className="space-y-1">
                              <p className="font-bold flex items-center gap-1">
                                <Store className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {o.store?.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-light">
                                <User className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                                Pembeli: {o.buyer?.username}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-manifest-ink">{o.deliveryMethod}</p>
                              <p className="text-[10px] text-muted-foreground font-light">Batas: {getSlaLabel(o.deliveryMethod)}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="space-y-1.5">
                              <StatusBadge status={o.status} />
                              <p className="text-[10px] text-muted-foreground font-light">
                                Kurir: {o.driver?.username || <span className="italic text-cargo-amber font-semibold">Mencari...</span>}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-tide-coral">
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span className="font-mono text-[11px] font-bold tracking-wide">{calculateLateTime(o.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                            {new Date(o.createdAt).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
