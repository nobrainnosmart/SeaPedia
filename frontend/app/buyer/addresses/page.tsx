"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, MapPin, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Alamat...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-sea-mid">Logistik</span>
                <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">Daftar Alamat</h1>
                <p className="text-muted-foreground text-xs font-light mt-0.5">Kelola alamat pengiriman untuk pesanan Anda.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* "+ Tambah Alamat Baru" Dashed Card */}
              <div
                onClick={openAddModal}
                className="border-2 border-dashed border-line hover:border-sea-mid/40 bg-sea-foam/5 hover:bg-sea-foam/10 rounded-default min-h-[220px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group gap-2 text-center"
              >
                <div className="h-10 w-10 bg-white border border-line rounded-full flex items-center justify-center text-muted-foreground group-hover:text-sea-mid group-hover:border-sea-mid/30 transition-colors shadow-sm">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-manifest-ink">Tambah Alamat Baru</h4>
                  <p className="text-[10px] text-muted-foreground font-light max-w-[180px] mt-0.5">
                    Lengkapi tujuan pengiriman baru Anda
                  </p>
                </div>
              </div>

              {addresses.map((addr) => (
                <Card 
                  key={addr.id} 
                  className={cn(
                    "border bg-white rounded-default p-5 shadow-card flex flex-col justify-between min-h-[220px] transition-all relative overflow-hidden",
                    addr.isDefault ? "border-sea-mid ring-1 ring-sea-mid/10" : "border-line"
                  )}
                >
                  {/* Subtle MapPin Icon in the background */}
                  <MapPin className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-muted-foreground/3 pointer-events-none transform rotate-12 stroke-1" />

                  <div className="z-10">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-manifest-ink text-sm font-display">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="inline-flex items-center rounded bg-cargo-amber/15 px-2 py-0.5 text-[9px] font-bold text-cargo-amber border border-cargo-amber/10">
                            Utama
                          </span>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-0.5">
                        {!addr.isDefault && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-muted-foreground hover:text-cargo-amber hover:bg-cargo-amber/5 rounded"
                            title="Set Utama"
                            onClick={() => handleSetDefault(addr.id)}
                          >
                            <Star className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-sea-mid hover:bg-sea-foam rounded"
                          title="Edit"
                          onClick={() => openEditModal(addr)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-tide-coral hover:bg-tide-coral/5 rounded"
                          title="Hapus"
                          onClick={() => handleDelete(addr.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground font-light space-y-1 leading-relaxed">
                      <p className="font-semibold text-manifest-ink text-xs">{addr.recipientName}</p>
                      <p className="font-mono text-[11px] tracking-wide tabular-nums">{addr.phone}</p>
                      <p className="line-clamp-2">{addr.addressLine}</p>
                      <p>{addr.city}, {addr.province} {addr.postalCode}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add / Edit Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="max-w-md bg-white rounded-default border border-line p-6 text-manifest-ink">
                <DialogHeader className="mb-3">
                  <DialogTitle className="text-base font-bold font-display text-sea-deep">
                    {editAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground font-light mt-1">
                    Lengkapi detail tujuan pengiriman paket Anda.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Label Alamat</label>
                      <Input placeholder="Rumah, Kantor, dll" value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Nama Penerima</label>
                      <Input placeholder="Nama lengkap" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">No. Telepon</label>
                      <Input placeholder="08xxxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Kode Pos</label>
                      <Input placeholder="5 digit kode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid font-mono" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Alamat Lengkap</label>
                    <textarea 
                      placeholder="Nama jalan, Blok, No. rumah, RT/RW, Kelurahan/Kecamatan" 
                      value={addressLine} 
                      onChange={(e) => setAddressLine(e.target.value)} 
                      rows={3} 
                      className="w-full rounded-lg border border-line p-3 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-sea-mid transition" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Kota / Kabupaten</label>
                      <Input placeholder="Nama Kota" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Provinsi</label>
                      <Input placeholder="Nama Provinsi" value={province} onChange={(e) => setProvince(e.target.value)} className="rounded-lg border-line bg-white h-9 text-xs focus-visible:ring-1 focus-visible:ring-sea-mid" />
                    </div>
                  </div>

                  <div className="pt-1.5">
                    <label className="flex items-center space-x-3 cursor-pointer text-xs font-semibold text-manifest-ink bg-sea-foam/15 p-2.5 rounded-lg border border-line hover:bg-sea-foam/20 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={isDefault} 
                        onChange={(e) => setIsDefault(e.target.checked)} 
                        className="h-4 w-4 rounded border-line text-sea-mid focus:ring-sea-mid cursor-pointer" 
                      />
                      <span>Jadikan alamat utama / default</span>
                    </label>
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
                        <span>Simpan Alamat</span>
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
