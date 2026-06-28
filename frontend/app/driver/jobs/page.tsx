"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Truck, MapPin, Store, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

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
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat pekerjaan...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Pekerjaan Pengiriman Tersedia</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">Ambil pekerjaan pengantaran dan dapatkan ongkos kirim sebagai penghasilan Anda.</p>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
                <Truck className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <p className="text-zinc-400 font-light">Belum ada pekerjaan pengiriman saat ini. Silakan coba beberapa saat lagi!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      {/* Header info */}
                      <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                        <div>
                          <p className="text-xs text-zinc-400 font-mono">ID: #{job.id.slice(-8).toUpperCase()}</p>
                          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20 mt-1">
                            {job.deliveryMethod}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pendapatan</p>
                          <p className="text-lg font-extrabold text-emerald-600">Rp {job.deliveryFee.toLocaleString("id-ID")}</p>
                        </div>
                      </div>

                      {/* Store detail */}
                      <div className="flex gap-3">
                        <Store className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ambil Dari Toko</p>
                          <p className="text-sm font-bold text-zinc-900">{job.store?.name}</p>
                        </div>
                      </div>

                      {/* Destination detail */}
                      <div className="flex gap-3">
                        <MapPin className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Kirim Ke</p>
                          <p className="text-sm font-bold text-zinc-900">{job.deliveryAddress?.recipientName}</p>
                          <p className="text-xs font-light text-zinc-500 mt-1 leading-normal">
                            {job.deliveryAddress?.addressLine}, {job.deliveryAddress?.city}, {job.deliveryAddress?.province}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAcceptJob(job.id)}
                      disabled={acceptingId !== null}
                      className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl py-6 font-bold flex items-center justify-center gap-1.5"
                    >
                      {acceptingId === job.id ? "Memproses..." : "Ambil Pekerjaan Ini"}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
