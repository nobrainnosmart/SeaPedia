"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Price from "@/components/ui/Price";
import { cn } from "@/lib/utils";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
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
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await api.get("/admin/promos");
      setPromos(res.data);
    } catch (err) {
      toast.error("Gagal memuat daftar promo.");
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
      await api.post("/admin/promos", payload);
      toast.success("Promo global berhasil dibuat!");
      setIsOpen(false);
      
      // Reset form states
      setCode("");
      setDiscountType("FIXED");
      setDiscountValue("");
      setMinPurchase("");
      setMaxDiscount("");
      setLimitCount("");

      fetchPromos();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal membuat promo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Informasi Promo...</span>
          </div>
        ) : (
          <div className="space-y-6 text-manifest-ink">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-role-admin">Kupon Promo</span>
                <h1 className="text-2xl font-bold font-display mt-0.5">Promo Platform (Global)</h1>
                <p className="text-muted-foreground text-xs font-light mt-0.5">Kelola kupon diskon global platform yang dapat digunakan pada transaksi belanja.</p>
              </div>
              <Button 
                onClick={() => setIsOpen(true)} 
                className="bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg px-4 h-9 text-xs font-bold border-0 shadow-sm flex items-center gap-1.5 w-fit shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Promo Baru</span>
              </Button>
            </div>

            {promos.length === 0 ? (
              <div className="text-center py-20 bg-white border border-line rounded-default shadow-card flex flex-col items-center">
                <div className="p-4 rounded-full bg-sea-foam text-sea-mid mb-4 border border-line">
                  <Ticket className="h-8 w-8 stroke-1" />
                </div>
                <h2 className="text-base font-bold font-display">Belum Ada Promo Global</h2>
                <p className="text-muted-foreground text-xs font-light mt-1">Buat kode promo platform pertama Anda sekarang.</p>
              </div>
            ) : (
              <div className="bg-white border border-line rounded-default overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-line bg-sea-foam/15 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="px-5 py-3.5 font-medium">Kode Kupon</th>
                        <th className="px-5 py-3.5 font-medium">Tipe</th>
                        <th className="px-5 py-3.5 font-medium">Nominal / Persentase</th>
                        <th className="px-5 py-3.5 font-medium">Syarat Min. Belanja</th>
                        <th className="px-5 py-3.5 font-medium">Maks. Potongan</th>
                        <th className="px-5 py-3.5 font-medium">Kuota Terpakai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-xs text-manifest-ink">
                      {promos.map((p) => (
                        <tr key={p.id} className="hover:bg-sea-foam/5 transition-colors">
                          <td className="px-5 py-3.5 font-bold font-mono text-sea-deep">{p.code}</td>
                          <td className="px-5 py-3.5">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border",
                              p.discountType === "PERCENT"
                                ? "bg-role-buyer/10 text-role-buyer border-role-buyer/15"
                                : "bg-role-seller/10 text-role-seller border-role-seller/15"
                            )}>
                              {p.discountType}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-bold">
                            {p.discountType === "PERCENT" ? (
                              <span className="font-mono">{p.discountValue}%</span>
                            ) : (
                              <Price amount={p.discountValue} className="font-bold text-manifest-ink text-xs" />
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <Price amount={p.minPurchase} className="font-bold text-manifest-ink text-xs" />
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {p.maxDiscount ? (
                              <Price amount={p.maxDiscount} className="font-bold text-muted-foreground text-xs" />
                            ) : (
                              <span className="font-light">-</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                            {p.usedCount} &bull; limit {p.limitCount} kuota
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add Promo Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="max-w-md bg-white rounded-default border border-line p-6 text-manifest-ink">
                <DialogHeader className="mb-3">
                  <DialogTitle className="text-base font-bold font-display text-sea-deep">Tambah Promo Global Baru</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground font-light mt-1">Buat kupon promo platform global untuk seluruh transaksi.</DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Kode Promo</label>
                    <Input placeholder="Contoh: MEGASALE15" value={code} onChange={(e) => setCode(e.target.value)} className="rounded-lg border-line bg-white h-9 text-xs uppercase font-mono" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tipe Diskon</label>
                      <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="w-full h-9 rounded-lg border border-line bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-sea-mid transition">
                        <option value="FIXED">FIXED (Nominal)</option>
                        <option value="PERCENT">PERCENT (Persentase)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nilai Diskon</label>
                      <Input type="number" placeholder="Contoh: 10 atau 15000" value={discountValue} onChange={(e) => setDiscountValue(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-lg border-line bg-white h-9 text-xs font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Min. Belanja (Rp)</label>
                      <Input type="number" placeholder="Contoh: 100000" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-lg border-line bg-white h-9 text-xs font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Maks. Potongan (Rp)</label>
                      <Input type="number" placeholder="Kosongkan jika FIXED" value={maxDiscount || ""} onChange={(e) => setMaxDiscount(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-lg border-line bg-white h-9 text-xs font-mono" disabled={discountType === "FIXED"} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Kuota Limit Penggunaan</label>
                    <Input type="number" placeholder="Contoh: 100" value={limitCount} onChange={(e) => setLimitCount(e.target.value === "" ? "" : Number(e.target.value))} className="rounded-lg border-line bg-white h-9 text-xs font-mono" />
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-line mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-lg text-xs h-9">
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg px-4 h-9 text-xs font-bold border-0 shadow-sm flex items-center gap-1.5"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <span>Buat Promo</span>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
