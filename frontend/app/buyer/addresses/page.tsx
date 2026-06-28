"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, MapPin, Pencil, Trash, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function BuyerAddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<any>(null);

  // Form states
  const [label, setLabel] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/buyer/addresses");
      setAddresses(res.data);
    } catch (err) {
      toast.error("Gagal memuat daftar alamat.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditAddress(null);
    setLabel("");
    setRecipientName("");
    setPhone("");
    setAddressLine("");
    setCity("");
    setProvince("");
    setPostalCode("");
    setIsDefault(false);
    setIsOpen(true);
  };

  const openEditModal = (addr: any) => {
    setEditAddress(addr);
    setLabel(addr.label);
    setRecipientName(addr.recipientName);
    setPhone(addr.phone);
    setAddressLine(addr.addressLine);
    setCity(addr.city);
    setProvince(addr.province);
    setPostalCode(addr.postalCode);
    setIsDefault(addr.isDefault);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !recipientName || !phone || !addressLine || !city || !province || !postalCode) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    setSubmitting(true);
    const payload = { label, recipientName, phone, addressLine, city, province, postalCode, isDefault };

    try {
      if (editAddress) {
        await api.put(`/buyer/addresses/${editAddress.id}`, payload);
        toast.success("Alamat berhasil diperbarui!");
      } else {
        await api.post("/buyer/addresses", payload);
        toast.success("Alamat berhasil ditambahkan!");
      }
      setIsOpen(false);
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menyimpan alamat.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus alamat ini?")) return;
    try {
      await api.delete(`/buyer/addresses/${id}`);
      toast.success("Alamat berhasil dihapus.");
      fetchAddresses();
    } catch (err) {
      toast.error("Gagal menghapus alamat.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/buyer/addresses/${id}/default`);
      toast.success("Alamat utama berhasil diganti!");
      fetchAddresses();
    } catch (err) {
      toast.error("Gagal mengatur alamat utama.");
    }
  };

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat alamat...</div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-zinc-950">Daftar Alamat</h1>
                <p className="text-zinc-500 text-sm font-light mt-0.5">Kelola alamat pengiriman pesanan belanja Anda.</p>
              </div>
              <Button onClick={openAddModal} className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg flex items-center gap-1.5 w-fit">
                <Plus className="h-4 w-4" />
                Tambah Alamat Baru
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
                <p className="text-zinc-400 font-light">Belum ada alamat tersimpan. Silakan tambahkan alamat baru.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <Card key={addr.id} className={cn("border bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-colors", addr.isDefault ? "border-indigo-500 ring-1 ring-indigo-500/20" : "border-zinc-200")}>
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 text-base">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                              Utama
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900" onClick={() => openEditModal(addr)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(addr.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-zinc-700 font-light space-y-1 mb-4 leading-relaxed">
                        <p className="font-semibold text-zinc-800">{addr.recipientName}</p>
                        <p>{addr.phone}</p>
                        <p>{addr.addressLine}</p>
                        <p>{addr.city}, {addr.province} {addr.postalCode}</p>
                      </div>
                    </div>
                    {!addr.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(addr.id)} className="w-full rounded-lg border-zinc-200 text-zinc-700">
                        Atur Sebagai Alamat Utama
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Add / Edit Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="max-w-md bg-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">{editAddress ? "Edit Alamat" : "Tambah Alamat Baru"}</DialogTitle>
                  <DialogDescription className="font-light">Lengkapi detail tujuan pengiriman paket Anda.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Label Alamat</label>
                      <Input placeholder="Contoh: Rumah, Kantor" value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-lg border-zinc-200" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Nama Penerima</label>
                      <Input placeholder="Nama lengkap" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="rounded-lg border-zinc-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Telepon</label>
                      <Input placeholder="Contoh: 08123456789" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border-zinc-200" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Kode Pos</label>
                      <Input placeholder="Kode Pos (5 digit)" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="rounded-lg border-zinc-200" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Alamat Lengkap</label>
                    <textarea placeholder="Nama jalan, Nomor rumah, RT/RW, Dusun/Kelurahan" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} rows={3} className="w-full rounded-lg border border-zinc-200 p-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-transparent transition" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Kota</label>
                      <Input placeholder="Nama Kota" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-lg border-zinc-200" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Provinsi</label>
                      <Input placeholder="Nama Provinsi" value={province} onChange={(e) => setProvince(e.target.value)} className="rounded-lg border-zinc-200" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center space-x-3 cursor-pointer text-sm font-medium text-zinc-700 bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-150">
                      <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer" />
                      <span>Jadikan alamat utama / default</span>
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-lg">
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg">
                      {submitting ? "Menyimpan..." : "Simpan Alamat"}
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
