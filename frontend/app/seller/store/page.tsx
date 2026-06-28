"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Store, Pencil, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SellerStorePage() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

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

    try {
      const res = await api.post("/seller/store", { name, description });
      setStore(res.data);
      toast.success("Toko berhasil dibuat!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal membuat toko.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama toko tidak boleh kosong.");
      return;
    }

    try {
      const res = await api.put("/seller/store", { name, description });
      setStore(res.data);
      setIsEditOpen(false);
      toast.success("Toko berhasil diperbarui!");
      fetchStore();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal memperbarui toko.");
    }
  };

  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat...</div>
        ) : !store ? (
          /* Create Store Card */
          <Card className="max-w-xl mx-auto border border-zinc-200 bg-white rounded-3xl shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-zinc-100 text-zinc-700 rounded-full flex items-center justify-center mb-4">
                <Store className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">Buat Toko Baru</CardTitle>
              <CardDescription className="font-light">Mulai berjualan dengan mendaftarkan nama toko Anda.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreate}>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nama Toko</label>
                  <Input
                    placeholder="Nama Toko Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Deskripsi</label>
                  <textarea
                    placeholder="Deskripsikan barang atau layanan yang ditawarkan..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-zinc-200 p-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-transparent transition"
                  />
                </div>
                <Button type="submit" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg">
                  Buat Toko
                </Button>
              </CardContent>
            </form>
          </Card>
        ) : (
          /* View Store Details */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-zinc-950">Toko Saya</h1>
              <Button onClick={() => setIsEditOpen(true)} className="flex items-center gap-1.5 rounded-lg border-zinc-200" variant="outline">
                <Pencil className="h-4 w-4" />
                Edit Profil Toko
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border border-zinc-200 bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-zinc-100 text-zinc-700 rounded-2xl flex items-center justify-center border border-zinc-200">
                    <Store className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">{store.name}</h2>
                    <p className="text-sm text-zinc-500 font-light mt-1">
                      {store.description || "Belum ada deskripsi."}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border border-zinc-200 bg-white rounded-3xl p-8 shadow-sm flex flex-col justify-center items-center text-center">
                <span className="text-sm text-zinc-400 font-light">Total Produk</span>
                <span className="text-4xl font-extrabold text-zinc-950 mt-1">
                  {store._count?.products || 0}
                </span>
              </Card>
            </div>

            {/* Edit Store Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-md bg-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Edit Profil Toko</DialogTitle>
                  <DialogDescription className="font-light">Sesuaikan detail profil toko Anda.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="space-y-4 mt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nama Toko</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-lg border-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Deskripsi</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-zinc-200 p-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-transparent transition"
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-lg">
                      Batal
                    </Button>
                    <Button type="submit" className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg">
                      Simpan Perubahan
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
