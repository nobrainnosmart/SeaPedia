"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Truck, Store, User, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import StatusBadge from "@/components/ui/StatusBadge";

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

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        <div className="space-y-6 text-manifest-ink">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-role-admin">Manajemen Sistem</span>
              <h1 className="text-2xl font-bold font-display mt-0.5">Semua Pekerjaan Pengiriman</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">
                {loading ? "Memuat..." : `Daftar ${jobs.length} penugasan kurir kargo aktif.`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-sea-foam/50 rounded-lg animate-pulse border border-line" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white border border-line rounded-default shadow-card flex flex-col items-center">
              <div className="p-4 rounded-full bg-sea-foam text-sea-mid mb-4 border border-line">
                <Truck className="h-8 w-8 stroke-1" />
              </div>
              <h2 className="text-base font-bold font-display">Tidak Ada Tugas Pengiriman</h2>
              <p className="text-muted-foreground text-xs font-light mt-1">Belum ada tugas pengantaran cargo yang tercatat di platform.</p>
            </div>
          ) : (
            <div className="bg-white border border-line rounded-default overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-sea-foam/15 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="px-5 py-3.5 font-medium">ID Pesanan</th>
                      <th className="px-5 py-3.5 font-medium">Mitra Toko & Penerima</th>
                      <th className="px-5 py-3.5 font-medium">Kurir Ditugaskan</th>
                      <th className="px-5 py-3.5 font-medium">Metode / Ongkir</th>
                      <th className="px-5 py-3.5 font-medium">Status Pengiriman</th>
                      <th className="px-5 py-3.5 font-medium">Tanggal Tugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-xs text-manifest-ink">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-sea-foam/5 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold">#{job.id.slice(-8).toUpperCase()}</td>
                        <td className="px-5 py-3.5">
                          <div className="space-y-1">
                            <p className="font-bold flex items-center gap-1">
                              <Store className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              {job.store?.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-light">
                              <User className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                              Kirim ke: {job.deliveryAddress?.recipientName}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {job.driver ? (
                            <p className="font-bold text-sea-mid flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-sea-mid shrink-0" />
                              {job.driver.username}
                            </p>
                          ) : (
                            job.status !== "SEDANG_DIKEMAS" && job.status !== "DIKEMBALIKAN" ? (
                              <span className="text-[10px] text-cargo-amber font-semibold italic">Mencari kurir...</span>
                            ) : (
                              <span className="text-muted-foreground/40 font-light">-</span>
                            )
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-manifest-ink">{job.deliveryMethod}</p>
                            <Price amount={job.deliveryFee} size="sm" className="font-bold text-role-seller" />
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                          {new Date(job.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
