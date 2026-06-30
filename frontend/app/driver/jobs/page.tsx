"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Truck, MapPin, Store, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import Link from "next/link";

export default function DriverJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/driver/jobs");
      setJobs(res.data);
    } catch (err) {
      toast.error("Gagal memuat pekerjaan pengiriman.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    setAcceptingId(jobId);
    try {
      await api.post(`/driver/jobs/${jobId}/accept`);
      toast.success("Pekerjaan berhasil diambil!");
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal mengambil pekerjaan.");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <ProtectedRoute allowedRole="DRIVER">
      <DashboardLayout>
        <div className="max-w-md mx-auto space-y-6 pb-12 text-manifest-ink">
          {/* Header */}
          <div className="space-y-1.5">
            <Link
              href="/driver/dashboard"
              className="text-xs text-muted-foreground hover:text-manifest-ink transition flex items-center gap-1.5 w-fit p-1 rounded hover:bg-sea-foam/40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold font-display">Pekerjaan Tersedia</h1>
            <p className="text-muted-foreground text-xs font-light">Ambil pekerjaan kurir kargo di bawah ini untuk memperoleh ongkir.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="text-xs text-muted-foreground animate-pulse font-mono">Mencari Order Cargo...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-line rounded-default shadow-card flex flex-col items-center">
              <div className="p-4 rounded-full bg-sea-foam text-sea-mid mb-4 border border-line">
                <Truck className="h-8 w-8 stroke-1" />
              </div>
              <h2 className="text-base font-bold font-display">Tidak Ada Tugas Baru</h2>
              <p className="text-muted-foreground text-xs font-light mt-1 max-w-[200px] leading-relaxed">
                Belum ada pengantaran rute kargo saat ini. Silakan coba berkala.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="border border-line bg-white rounded-default p-4 shadow-card flex flex-col justify-between space-y-4 hover:border-role-driver/30 transition-all"
                >
                  {/* Job Header */}
                  <div className="flex justify-between items-start border-b border-line pb-2.5">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-mono">ID: #{job.id.slice(-8).toUpperCase()}</p>
                      <span className="inline-flex items-center rounded bg-sea-foam px-2 py-0.5 text-[9px] font-bold text-sea-mid border border-line mt-1 uppercase">
                        {job.deliveryMethod}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Ongkir Payout</p>
                      <Price amount={job.deliveryFee} size="base" className="font-bold text-role-seller" />
                    </div>
                  </div>

                  {/* Pickup */}
                  <div className="flex gap-2.5 items-start">
                    <Store className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                    <div className="min-w-0 text-xs">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Lokasi Ambil (Toko)</p>
                      <p className="font-bold text-manifest-ink mt-0.5 truncate">{job.store?.name}</p>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex gap-2.5 items-start">
                    <MapPin className="h-4.5 w-4.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                    <div className="min-w-0 text-xs">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tujuan Pengiriman</p>
                      <p className="font-bold text-manifest-ink mt-0.5">{job.deliveryAddress?.recipientName}</p>
                      <p className="text-muted-foreground mt-1 leading-normal font-light truncate" title={job.deliveryAddress?.addressLine}>
                        {job.deliveryAddress?.addressLine}, {job.deliveryAddress?.city}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAcceptJob(job.id)}
                    disabled={acceptingId !== null}
                    className="w-full bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg py-5 text-xs font-bold border-0 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {acceptingId === job.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Mengonfirmasi...</span>
                      </>
                    ) : (
                      <span>Ambil Rute Pengiriman</span>
                    )}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
