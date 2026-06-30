"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import { cn } from "@/lib/utils";

export default function BuyerWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [isGlow, setIsGlow] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get("/buyer/wallet");
      setWallet(res.data);
    } catch (err) {
      toast.error("Gagal memuat saldo dompet.");
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error("Masukkan jumlah top up yang valid.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/buyer/wallet/topup", { amount: Number(amount) });
      setWallet(res.data);
      setAmount("");
      toast.success("Top up berhasil dilakukan!");
      
      // Trigger glow pulse animation
      setIsGlow(true);
      setTimeout(() => setIsGlow(false), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.amount?.[0] || "Gagal melakukan top up.");
    } finally {
      setSubmitting(false);
    }
  };

  const quickAmounts = [
    { value: 50000, label: "50rb" },
    { value: 100000, label: "100rb" },
    { value: 500000, label: "500rb" },
    { value: 1000000, label: "1jt" }
  ];

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Informasi Dompet...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sea-mid">Finansial</span>
              <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">Dompet Saya</h1>
              <p className="text-muted-foreground text-xs font-light mt-0.5">Kelola saldo digital dan riwayat transaksi belanja Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Balance card with glow effect */}
              <div 
                className={cn(
                  "lg:col-span-1 rounded-default p-6 flex flex-col justify-between h-44 transition-all duration-700 relative overflow-hidden",
                  isGlow 
                    ? "bg-sea-mid shadow-[0_0_30px_rgba(19,122,133,0.4)] text-white scale-[1.02]" 
                    : "bg-sea-deep text-white shadow-card"
                )}
              >
                {/* Faint large watermark Wallet icon in the corner */}
                <Wallet className="absolute right-[-15px] bottom-[-15px] h-28 w-28 text-white/5 pointer-events-none transform -rotate-12 stroke-1" />
                
                <div className="flex justify-between items-start z-10">
                  <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Total Saldo Aktif</span>
                  <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                    <Wallet className="h-4 w-4 text-cargo-amber" />
                  </div>
                </div>
                
                <div className="z-10 space-y-1">
                  <div className="text-white">
                    <Price amount={wallet?.balance || 0} size="3xl" className="text-white font-bold text-2xl md:text-3xl" />
                  </div>
                  <p className="text-[10px] text-white/50 font-light">Saldo dipotong otomatis saat transaksi checkout.</p>
                </div>
              </div>

              {/* Top up card */}
              <Card className="lg:col-span-2 border border-line bg-white rounded-default shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-manifest-ink font-display">Isi Saldo (Top Up)</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-light">Pilih jumlah cepat atau masukkan nilai kustom nominal top up.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick amounts */}
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amt) => (
                      <Button
                        key={amt.value}
                        type="button"
                        variant="outline"
                        onClick={() => setAmount(amt.value)}
                        className="rounded-lg border-line text-xs font-semibold text-manifest-ink h-8 px-3 hover:bg-sea-foam hover:border-sea-mid/20 transition-colors"
                      >
                        Rp {amt.value.toLocaleString("id-ID")}
                      </Button>
                    ))}
                  </div>

                  <form onSubmit={handleTopup} className="flex gap-3">
                    <div className="relative flex-grow">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">Rp</span>
                      <Input
                        type="number"
                        placeholder="Masukkan nominal isi saldo"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        className="pl-8 rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid focus-visible:border-transparent font-mono tabular-nums"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      className="bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg px-5 h-9 text-xs font-bold border-0 shadow-sm shrink-0 flex items-center gap-1.5"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Mengisi...</span>
                        </>
                      ) : (
                        <span>Top Up</span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Transaction history */}
            <div className="bg-white border border-line rounded-default p-5 md:p-6 shadow-card">
              <h2 className="text-sm font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground mb-4">
                Riwayat Transaksi Dompet
              </h2>

              {!wallet?.transactions || wallet.transactions.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-line rounded-lg text-xs font-light text-muted-foreground">
                  Belum ada catatan riwayat transaksi dompet digital.
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-line text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="pb-3 font-medium">Tanggal Transaksi</th>
                          <th className="pb-3 font-medium">Tipe</th>
                          <th className="pb-3 font-medium">Keterangan</th>
                          <th className="pb-3 text-right font-medium">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-xs text-manifest-ink">
                        {wallet.transactions.map((tx: any) => {
                          const isIncome = tx.type === "TOPUP" || tx.type === "REFUND";
                          
                          let typeBadgeClass = "";
                          if (tx.type === "TOPUP") typeBadgeClass = "bg-role-seller/10 text-role-seller border-role-seller/20";
                          else if (tx.type === "PAYMENT") typeBadgeClass = "bg-manifest-ink/10 text-manifest-ink border-manifest-ink/20";
                          else if (tx.type === "REFUND") typeBadgeClass = "bg-role-buyer/10 text-role-buyer border-role-buyer/20";

                          return (
                            <tr key={tx.id} className="hover:bg-sea-foam/5 transition-colors">
                              <td className="py-3.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                                {new Date(tx.createdAt).toLocaleString("id-ID", {
                                  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                                })}
                              </td>
                              <td className="py-3.5">
                                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase", typeBadgeClass)}>
                                  {isIncome ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                  {tx.type}
                                </span>
                              </td>
                              <td className="py-3.5 font-light text-muted-foreground">{tx.description}</td>
                              <td className="py-3.5 text-right font-bold">
                                <span className={isIncome ? "text-role-seller" : "text-tide-coral"}>
                                  {isIncome ? "+" : "-"} <Price amount={tx.amount} className="font-bold text-inherit" />
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Stacked Card View */}
                  <div className="md:hidden space-y-3">
                    {wallet.transactions.map((tx: any) => {
                      const isIncome = tx.type === "TOPUP" || tx.type === "REFUND";
                      
                      let typeBadgeClass = "";
                      if (tx.type === "TOPUP") typeBadgeClass = "bg-role-seller/10 text-role-seller border-role-seller/20";
                      else if (tx.type === "PAYMENT") typeBadgeClass = "bg-manifest-ink/10 text-manifest-ink border-manifest-ink/20";
                      else if (tx.type === "REFUND") typeBadgeClass = "bg-role-buyer/10 text-role-buyer border-role-buyer/20";

                      return (
                        <div key={tx.id} className="border border-line rounded-lg p-3 bg-white space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                              {new Date(tx.createdAt).toLocaleString("id-ID", {
                                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                            <span className={cn("inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase", typeBadgeClass)}>
                              {tx.type}
                            </span>
                          </div>
                          <p className="text-xs text-manifest-ink font-light">{tx.description}</p>
                          <div className="flex justify-end pt-1">
                            <span className={cn("text-xs font-bold", isIncome ? "text-role-seller" : "text-tide-coral")}>
                              {isIncome ? "+" : "-"} <Price amount={tx.amount} className="font-bold text-inherit text-xs" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
