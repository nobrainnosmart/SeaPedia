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
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Waktu Jam Simulasi...</span>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-6 text-manifest-ink">
            {/* Header */}
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-role-admin">Simulasi Waktu</span>
              <h1 className="text-2xl font-bold font-display mt-0.5">Siklus Waktu Sistem</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">Percepat waktu sistem untuk menguji batas rute pengantaran (SLA) kurir cargo.</p>
            </div>

            {/* Virtual Clock Display (Premium Dark Container) */}
            <Card className="border border-line bg-manifest-ink text-white rounded-default p-8 shadow-card flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Background ambient accent */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-role-admin/15 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 space-y-3">
                <span className="text-[10px] text-white/50 font-semibold uppercase tracking-wider block">Waktu Sistem Virtual</span>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight font-mono text-role-admin select-all">
                  {new Date(data.virtualTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
                <div className="text-xs font-light text-white/70">
                  {new Date(data.virtualTime).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-role-admin/25 px-3 py-1 text-[10px] font-bold text-role-admin border border-role-admin/20 mt-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatOffset(data.offsetMs)}</span>
                </div>
              </div>
            </Card>

            {/* Controls */}
            <Card className="border border-line bg-white rounded-default p-5 shadow-card space-y-4">
              <h2 className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-line pb-2.5">
                <Zap className="h-4.5 w-4.5 text-cargo-amber shrink-0" />
                Percepat Jam Waktu Sistem
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  onClick={() => handleSimulate({ hours: 1 })}
                  disabled={processing}
                  variant="outline"
                  className="rounded-lg py-4 border-line hover:bg-sea-foam/40 flex flex-col h-auto text-center justify-center cursor-pointer"
                >
                  <Play className="h-4.5 w-4.5 text-muted-foreground/60 mb-1" />
                  <span className="text-xs font-bold text-manifest-ink">+1 Jam</span>
                </Button>

                <Button
                  onClick={() => handleSimulate({ hours: 6 })}
                  disabled={processing}
                  variant="outline"
                  className="rounded-lg py-4 border-line hover:bg-sea-foam/40 flex flex-col h-auto text-center justify-center cursor-pointer"
                >
                  <Play className="h-4.5 w-4.5 text-muted-foreground/60 mb-1" />
                  <span className="text-xs font-bold text-manifest-ink">+6 Jam</span>
                </Button>

                <Button
                  onClick={() => handleSimulate({ days: 1 })}
                  disabled={processing}
                  variant="outline"
                  className="rounded-lg py-4 border-line hover:bg-sea-foam/40 flex flex-col h-auto text-center justify-center cursor-pointer"
                >
                  <Play className="h-4.5 w-4.5 text-muted-foreground/60 mb-1" />
                  <span className="text-xs font-bold text-manifest-ink">+1 Hari</span>
                </Button>

                <Button
                  onClick={() => handleSimulate({ days: 3 })}
                  disabled={processing}
                  variant="outline"
                  className="rounded-lg py-4 border-line hover:bg-sea-foam/40 flex flex-col h-auto text-center justify-center cursor-pointer"
                >
                  <Play className="h-4.5 w-4.5 text-muted-foreground/60 mb-1" />
                  <span className="text-xs font-bold text-manifest-ink">+3 Hari</span>
                </Button>
              </div>

              <div className="border-t border-line pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-[10px] text-muted-foreground font-light flex items-center gap-1.5 font-mono">
                  <Calendar className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                  Waktu Nyata: {new Date(data.realTime).toLocaleString("id-ID")}
                </div>

                <Button
                  onClick={() => handleSimulate({ reset: true })}
                  disabled={processing || data.offsetMs === 0}
                  className="bg-tide-coral/10 hover:bg-tide-coral/15 border border-tide-coral/25 text-tide-coral rounded-lg px-4 h-8 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Waktu Nyata</span>
                </Button>
              </div>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
