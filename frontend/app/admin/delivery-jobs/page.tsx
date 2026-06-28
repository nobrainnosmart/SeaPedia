"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Truck, Store, User, MapPin, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

export default function AdminDeliveryJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/admin/delivery-jobs");
      setJobs(res.data);
    } catch (err) {
      toast.error("Gagal memuat semua pekerjaan pengiriman.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SEDANG_DIKEMAS":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "MENUNGGU_PENGIRIM":
        return "bg-purple-50 text-purple-700 ring-purple-600/20";
      case "SEDANG_DIKIRIM":
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
      case "PESANAN_SELESAI":
        return "bg-green-50 text-green-700 ring-green-600/20";
      case "DIKEMBALIKAN":
        return "bg-red-50 text-red-700 ring-red-600/20";
      default:
        return "bg-zinc-50 text-zinc-700 ring-zinc-600/20";
    }
  };

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat data pengiriman...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Semua Pekerjaan Pengiriman</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">Pantau status, kurir, dan biaya dari seluruh pengiriman yang sedang berjalan di platform.</p>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
                <Truck className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <p className="text-zinc-400 font-light">Belum ada aktivitas transaksi pengiriman di platform.</p>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <th className="px-6 py-4">ID Pesanan</th>
                        <th className="px-6 py-4">Pembeli / Toko</th>
                        <th className="px-6 py-4">Kurir Ditugaskan</th>
                        <th className="px-6 py-4">Metode / Tarif</th>
                        <th className="px-6 py-4">Status Pengiriman</th>
                        <th className="px-6 py-4">Tanggal Dibuat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 text-sm text-zinc-700">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-zinc-900">#{job.id.slice(-8).toUpperCase()}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-zinc-800 flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-zinc-400" />
                                {job.buyer?.username}
                              </p>
                              <p className="text-xs text-zinc-500 flex items-center gap-1 font-light">
                                <Store className="h-3.5 w-3.5 text-zinc-400" />
                                {job.store?.name}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {job.driver ? (
                              <p className="font-medium text-indigo-600 flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-indigo-400" />
                                {job.driver.username}
                              </p>
                            ) : (
                              job.status !== "SEDANG_DIKEMAS" && job.status !== "DIKEMBALIKAN" ? (
                                <span className="text-xs text-zinc-500 font-light italic">Mencari kurir...</span>
                              ) : (
                                <span className="text-xs text-zinc-400 font-light">-</span>
                              )
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <p className="font-medium text-zinc-800">{job.deliveryMethod}</p>
                              <p className="text-xs text-emerald-600 font-bold">Rp {job.deliveryFee.toLocaleString("id-ID")}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStatusBadge(job.status)}`}>
                              {job.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-light text-zinc-500">
                            {new Date(job.createdAt).toLocaleString("id-ID")}
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
