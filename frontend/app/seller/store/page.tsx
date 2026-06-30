"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Store, Pencil, Store as StoreIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SellerStorePage() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const res = await api.get("/seller/store");
      setStore(res.data);
      setName(res.data.name);
      setDescription(res.data.description || "");
    } catch (err: any) {
      if (err.response?.status !== 404) {
        toast.error("Gagal memuat informasi toko.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama toko wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/seller/store", { name, description });
      setStore(res.data);
      toast.success("Toko berhasil dibuat!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal membuat toko.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama toko tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put("/seller/store", { name, description });
      setStore(res.data);
      setIsEditOpen(false);
      toast.success("Toko berhasil diperbarui!");
      fetchStore();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal memperbarui toko.");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Profil Toko...</span>
          </div>
        ) : !store ? (
          /* Create Store Card */
          <Card className="max-w-xl mx-auto border border-line bg-white rounded-default shadow-card">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-12 w-12 bg-role-seller/10 text-role-seller rounded-full flex items-center justify-center mb-2 border border-role-seller/10">
                <StoreIcon className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold text-manifest-ink font-display">Registrasi Toko Baru</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-light">Mulai jualan online dengan mendaftarkan warung atau gudang Anda.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreate}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nama Toko</label>
                  <Input
                    placeholder="Contoh: Toko Sembako Makmur"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Deskripsi Layanan</label>
                  <textarea
                    placeholder="Jelaskan jenis pasokan kargo atau produk sedia jual..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-line p-3 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-sea-mid transition"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg h-9 text-xs font-bold border-0 shadow-sm"
                >
                  {submitting ? "Memproses..." : "Buat Toko Sekarang"}
                </Button>
              </CardContent>
            </form>
          </Card>
        ) : (
          /* View Store Details */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-role-seller">Profil Usaha</span>
                <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">Toko Saya</h1>
                <p className="text-muted-foreground text-xs font-light mt-0.5">Kelola identitas warung dan visual katalog pembeli Anda.</p>
              </div>
              <Button 
                onClick={() => setIsEditOpen(true)} 
                className="flex items-center gap-1.5 rounded-lg border-line hover:bg-sea-foam/40 h-9 text-xs font-semibold text-manifest-ink shrink-0 w-fit" 
                variant="outline"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Toko</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Profile Card */}
              <Card className="md:col-span-8 border border-line bg-white rounded-default p-6 shadow-card flex flex-col justify-center">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="h-16 w-16 bg-role-seller text-white rounded-full flex items-center justify-center font-bold text-xl shadow-inner border-2 border-white shrink-0">
                    {getInitials(store.name)}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-manifest-ink font-display leading-tight">{store.name}</h2>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">
                      {store.description || "Belum memiliki deskripsi toko."}
                    </p>
                    <div className="pt-2">
                      <Link 
                        href={`/stores/${store.id}`}
                        className="text-xs font-semibold text-role-seller hover:underline inline-flex items-center gap-1"
                      >
                        Lihat sebagai Pembeli &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Counters */}
              <Card className="md:col-span-4 border border-line bg-white rounded-default p-6 shadow-card flex flex-col justify-center items-center text-center">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Produk Jualan</span>
                <span className="text-4xl font-extrabold text-manifest-ink mt-1.5 font-mono tabular-nums">
                  {store._count?.products || 0}
                </span>
                <span className="text-[10px] text-muted-foreground/60 font-light mt-1">unit barang aktif di katalog</span>
              </Card>
            </div>

            {/* Edit Store Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-md bg-white rounded-default border border-line p-6 text-manifest-ink">
                <DialogHeader className="mb-3">
                  <DialogTitle className="text-base font-bold font-display text-sea-deep">Edit Profil Toko</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground font-light mt-1">Sesuaikan detail identitas toko Anda.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nama Toko</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Deskripsi</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-line p-3 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-sea-mid transition"
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-line mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-lg text-xs h-9">
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg px-4 h-9 text-xs font-bold border-0 shadow-sm"
                    >
                      {submitting ? "Menyimpan..." : "Simpan Perubahan"}
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
