"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Percent, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

export default function SellerVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENT">("FIXED");
  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [minPurchase, setMinPurchase] = useState<number | "">("");
  const [maxDiscount, setMaxDiscount] = useState<number | "">("");
  const [limitCount, setLimitCount] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await api.get("/seller/vouchers");
      setVouchers(res.data);
    } catch (err) {
      toast.error("Gagal memuat daftar voucher.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue || minPurchase === "" || !limitCount) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    setSubmitting(true);
    const payload = {
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      limitCount: Number(limitCount),
    };

    try {
      await api.post("/seller/vouchers", payload);
      toast.success("Voucher berhasil dibuat!");
      setIsOpen(false);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal membuat voucher.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat voucher...</div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-zinc-950">Voucher Toko</h1>
                <p className="text-zinc-500 text-sm font-light mt-0.5">Buat dan kelola voucher potongan harga untuk produk jualan toko Anda.</p>
              </div>
              <Button onClick={() => setIsOpen(true)} className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg flex items-center gap-1.5 w-fit">
                <Plus className="h-4 w-4" />
                Tambah Voucher Baru
              </Button>
            </div>

            {vouchers.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
                <Ticket className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <p className="text-zinc-400 font-light">Belum ada voucher toko. Silakan buat voucher pertama Anda!</p>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Kode Voucher</th>
                        <th className="px-6 py-4">Tipe Diskon</th>
                        <th className="px-6 py-4">Nilai Potongan</th>
                        <th className="px-6 py-4">Minimal Belanja</th>
                        <th className="px-6 py-4">Batas Potongan</th>
                        <th className="px-6 py-4">Penggunaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 text-sm text-zinc-700">
                      {vouchers.map((v) => (
                        <tr key={v.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold font-mono text-zinc-900">{v.code}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                              v.discountType === "PERCENT"
                                ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                                : "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            }`}>
                              {v.discountType}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-zinc-800">
                            {v.discountType === "PERCENT" ? `${v.discountValue}%` : `Rp ${v.discountValue.toLocaleString("id-ID")}`}
                          </td>
                          <td className="px-6 py-4">Rp {v.minPurchase.toLocaleString("id-ID")}</td>
                          <td className="px-6 py-4 text-zinc-500">
                            {v.maxDiscount ? `Rp ${v.maxDiscount.toLocaleString("id-ID")}` : "-"}
                          </td>
                          <td className="px-6 py-4 font-light text-zinc-500">
                            {v.usedCount} / {v.limitCount} kuota
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add Voucher Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="max-w-md bg-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Tambah Voucher Baru</DialogTitle>
                  <DialogDescription className="font-light">Buat kupon belanja kustom untuk menarik pelanggan toko Anda.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 mt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Kode Voucher</label>
                    <Input placeholder="Contoh: TOKOJAYA50" value={code} onChange={(e) => setCode(e.target.value)} className="rounded-lg border-zinc-200 uppercase font-mono" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Tipe Diskon</label>
                      <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-transparent transition">
                        <option value="FIXED">FIXED (Nominal)</option>
                        <option value="PERCENT">PERCENT (Persentase)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nilai Diskon</label>
                      <Input type="number" placeholder="Contoh: 10 atau 15000" value={discountValue} onChange={(e) => setDiscountValue(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-lg border-zinc-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Min. Pembelian</label>
                      <Input type="number" placeholder="Contoh: 100000" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-lg border-zinc-200" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Maks. Potongan (Persen)</label>
                      <Input type="number" placeholder="Kosongkan jika FIXED" value={maxDiscount || ""} onChange={(e) => setMaxDiscount(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-lg border-zinc-200" disabled={discountType === "FIXED"} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Kuota Penggunaan</label>
                    <Input type="number" placeholder="Contoh: 50" value={limitCount} onChange={(e) => setLimitCount(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-lg border-zinc-200" />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-lg">
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg">
                      {submitting ? "Menyimpan..." : "Buat Voucher"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
