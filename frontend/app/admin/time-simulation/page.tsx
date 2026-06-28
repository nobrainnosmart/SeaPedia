"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, RefreshCw, Zap, Calendar, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

export default function AdminTimeSimulationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTime();
    // Refresh display every 10 seconds to keep virtual clock somewhat moving
    const interval = setInterval(fetchTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTime = async () => {
    try {
      const res = await api.get("/admin/time-simulation");
      setData(res.data);
    } catch (err) {
      toast.error("Gagal memuat detail simulasi waktu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (params: { hours?: number; days?: number; reset?: boolean }) => {
    setProcessing(true);
    try {
      const res = await api.post("/admin/time-simulation", params);
      setData(res.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Gagal mengubah waktu simulasi.");
    } finally {
      setProcessing(false);
    }
  };

  const formatOffset = (offsetMs: number) => {
    if (offsetMs === 0) return "Sesuai Waktu Nyata";
    
    const absOffset = Math.abs(offsetMs);
    const totalHours = absOffset / (1000 * 60 * 60);
    const days = Math.floor(totalHours / 24);
    const hours = Math.floor(totalHours % 24);

    let res = "";
    if (days > 0) res += `${days} Hari `;
    if (hours > 0) res += `${hours} Jam `;
    
    return `${res}${offsetMs > 0 ? "Lebih Cepat" : "Lebih Lambat"}`;
  };

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat simulasi waktu...</div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Simulasi Waktu Sistem</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">Percepat waktu sistem untuk menguji batas waktu pengiriman (SLA) dan pesanan terlambat.</p>
            </div>

            {/* Virtual Clock Display */}
            <Card className="border border-zinc-200 bg-zinc-950 text-white rounded-3xl p-8 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Background accent */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full" />
              
              <div className="relative z-10 space-y-4">
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Waktu Sistem Virtual</p>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight font-mono text-indigo-400">
                  {new Date(data.virtualTime).toLocaleTimeString("id-ID")}
                </div>
                <div className="text-sm font-light text-zinc-300">
                  {new Date(data.virtualTime).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
                  <Clock className="h-3.5 w-3.5" />
                  {formatOffset(data.offsetMs)}
                </div>
              </div>
            </Card>

            {/* Controls */}
            <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-500" />
                Percepat Waktu Sistem
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => handleSimulate({ hours: 1 })}
                  disabled={processing}
                  variant="outline"
                  className="rounded-xl py-6 border-zinc-200 hover:bg-zinc-50 flex flex-col h-auto text-center"
                >
                  <Play className="h-5 w-5 text-zinc-400 mb-1 rotate-0" />
                  <span className="font-bold">+1 Jam</span>
                </Button>

                <Button
                  onClick={() => handleSimulate({ hours: 6 })}
                  disabled={processing}
                  variant="outline"
                  className="rounded-xl py-6 border-zinc-200 hover:bg-zinc-50 flex flex-col h-auto text-center"
                >
                  <Play className="h-5 w-5 text-zinc-400 mb-1" />
                  <span className="font-bold">+6 Jam</span>
                </Button>

                <Button
                  onClick={() => handleSimulate({ days: 1 })}
                  disabled={processing}
                  variant="outline"
                  className="rounded-xl py-6 border-zinc-200 hover:bg-zinc-50 flex flex-col h-auto text-center"
                >
                  <Play className="h-5 w-5 text-zinc-400 mb-1" />
                  <span className="font-bold">+1 Hari</span>
                </Button>

                <Button
                  onClick={() => handleSimulate({ days: 3 })}
                  disabled={processing}
                  variant="outline"
                  className="rounded-xl py-6 border-zinc-200 hover:bg-zinc-50 flex flex-col h-auto text-center"
                >
                  <Play className="h-5 w-5 text-zinc-400 mb-1" />
                  <span className="font-bold">+3 Hari</span>
                </Button>
              </div>

              <div className="border-t border-zinc-100 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-zinc-500 font-light flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  Waktu Nyata: {new Date(data.realTime).toLocaleString("id-ID")}
                </div>

                <Button
                  onClick={() => handleSimulate({ reset: true })}
                  disabled={processing || data.offsetMs === 0}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl px-4 py-2 font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset ke Waktu Nyata
                </Button>
              </div>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
