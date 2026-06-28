"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Clock, Store, User, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

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
    if (lateMs <= 0) return "Tepat Waktu (Baru Saja Terlambat)";

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
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat pesanan terlambat...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Pesanan Terlambat (SLA Breached)</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">Daftar pesanan aktif yang telah melebihi batas waktu SLA pengantaran berdasarkan simulasi waktu.</p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
                <ShieldAlert className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <p className="text-zinc-400 font-light">Hebat! Tidak ada pesanan yang terlambat saat ini.</p>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <th className="px-6 py-4">ID Pesanan</th>
                        <th className="px-6 py-4">Pihak Terlibat</th>
                        <th className="px-6 py-4">Metode & SLA</th>
                        <th className="px-6 py-4">Status / Kurir</th>
                        <th className="px-6 py-4">Keterlambatan</th>
                        <th className="px-6 py-4">Tanggal Dibuat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 text-sm text-zinc-700">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-zinc-900">#{o.id.slice(-8).toUpperCase()}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-zinc-800 flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-zinc-400" />
                                {o.buyer?.username}
                              </p>
                              <p className="text-xs text-zinc-500 flex items-center gap-1 font-light">
                                <Store className="h-3.5 w-3.5 text-zinc-400" />
                                {o.store?.name}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <p className="font-medium text-zinc-800">{o.deliveryMethod}</p>
                              <p className="text-xs text-zinc-500 font-light">SLA: {getSlaLabel(o.deliveryMethod)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                {o.status.replace("_", " ")}
                              </span>
                              <p className="text-xs text-zinc-500 font-light">
                                Kurir: {o.driver?.username || <span className="italic">Belum ada</span>}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-red-600 flex items-center gap-1.5 py-6">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {calculateLateTime(o.createdAt)}
                          </td>
                          <td className="px-6 py-4 font-light text-zinc-500">
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
