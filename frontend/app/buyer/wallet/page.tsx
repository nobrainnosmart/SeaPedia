"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Plus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

export default function BuyerWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

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
    } catch (err: any) {
      toast.error(err.response?.data?.error?.amount?.[0] || "Gagal melakukan top up.");
    } finally {
      setSubmitting(false);
    }
  };

  const quickAmounts = [50000, 100000, 500000, 1000000];

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat dompet...</div>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Dompet Saya</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">Kelola saldo digital dan riwayat transaksi belanja Anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Balance card */}
              <Card className="lg:col-span-1 border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[200px]">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-zinc-400 font-light">Total Saldo Aktif</span>
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-zinc-950">
                    Rp {wallet?.balance?.toLocaleString("id-ID") || 0}
                  </span>
                  <p className="text-xs text-zinc-400 font-light mt-2">Saldo otomatis berkurang saat melakukan checkout pesanan.</p>
                </div>
              </Card>

              {/* Top up card */}
              <Card className="lg:col-span-2 border border-zinc-200 bg-white rounded-3xl shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Isi Saldo (Top Up)</CardTitle>
                  <CardDescription className="font-light">Pilih jumlah cepat atau masukkan nilai kustom nominal top up.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant="outline"
                        onClick={() => setAmount(amt)}
                        className="rounded-lg border-zinc-200 font-medium"
                      >
                        Rp {amt.toLocaleString("id-ID")}
                      </Button>
                    ))}
                  </div>

                  <form onSubmit={handleTopup} className="flex gap-3">
                    <div className="relative flex-grow">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-semibold">Rp</span>
                      <Input
                        type="number"
                        placeholder="Masukkan nominal isi saldo"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        className="pl-9 rounded-lg border-zinc-200 bg-white"
                      />
                    </div>
                    <Button type="submit" disabled={submitting} className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg px-6">
                      {submitting ? "Mengisi..." : "Top Up"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Transaction history */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 mb-6">Riwayat Transaksi</h2>

              {!wallet?.transactions || wallet.transactions.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 font-light">Belum ada riwayat transaksi.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-150 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        <th className="pb-3">Tanggal</th>
                        <th className="pb-3">Tipe</th>
                        <th className="pb-3">Deskripsi</th>
                        <th className="pb-3 text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                      {wallet.transactions.map((tx: any) => {
                        const isIncome = tx.type === "TOPUP" || tx.type === "REFUND";
                        return (
                          <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="py-4 text-xs text-zinc-400">
                              {new Date(tx.createdAt).toLocaleString("id-ID")}
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                isIncome 
                                  ? "bg-green-50 text-green-700 ring-green-600/20"
                                  : "bg-red-50 text-red-700 ring-red-600/20"
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-4 font-light">{tx.description}</td>
                            <td className={`py-4 text-right font-bold ${isIncome ? "text-green-600" : "text-red-600"}`}>
                              {isIncome ? "+" : "-"} Rp {tx.amount.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
