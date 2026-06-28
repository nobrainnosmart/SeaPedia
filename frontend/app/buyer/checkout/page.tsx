"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, MapPin, Truck, Wallet, ShieldCheck, ArrowLeft, ArrowRight, Ticket, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function BuyerCheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<"INSTANT" | "NEXT_DAY" | "REGULAR">("REGULAR");
  const [submitting, setSubmitting] = useState(false);

  // Discount states
  const [voucherInput, setVoucherInput] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [activeVoucher, setActiveVoucher] = useState<any>(null);
  const [activePromo, setActivePromo] = useState<any>(null);

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    try {
      const [cartRes, addrRes, walletRes] = await Promise.all([
        api.get("/buyer/cart"),
        api.get("/buyer/addresses"),
        api.get("/buyer/wallet"),
      ]);

      setCart(cartRes.data);
      setAddresses(addrRes.data);
      setWallet(walletRes.data);

      // Default selected address
      const defaultAddr = addrRes.data.find((a: any) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addrRes.data.length > 0) {
        setSelectedAddressId(addrRes.data[0].id);
      }
    } catch (err) {
      toast.error("Gagal memuat data checkout.");
    } finally {
      setLoading(false);
    }
  };

  const deliveryOptions = [
    { key: "INSTANT", name: "Layanan Instan", fee: 25000, desc: "Tiba dalam 3 Jam" },
    { key: "NEXT_DAY", name: "Next Day", fee: 15000, desc: "Tiba besok hari" },
    { key: "REGULAR", name: "Pengiriman Reguler", fee: 9000, desc: "Tiba dalam 2-3 Hari" },
  ];

  // Validate Voucher
  const handleValidateVoucher = async () => {
    if (!voucherInput.trim()) return;
    try {
      const res = await api.post("/discounts/validate", { code: voucherInput.trim().toUpperCase() });
      if (res.data.type !== "VOUCHER") {
        toast.error("Kode tersebut adalah kode Promo, gunakan di input Promo Global.");
        return;
      }
      setActiveVoucher(res.data);
      toast.success("Voucher toko berhasil dipasang!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal memvalidasi voucher.");
    }
  };

  // Validate Promo
  const handleValidatePromo = async () => {
    if (!promoInput.trim()) return;
    try {
      const res = await api.post("/discounts/validate", { code: promoInput.trim().toUpperCase() });
      if (res.data.type !== "PROMO") {
        toast.error("Kode tersebut adalah kode Voucher Toko, gunakan di input Voucher Toko.");
        return;
      }
      setActivePromo(res.data);
      toast.success("Promo global berhasil dipasang!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal memvalidasi promo.");
    }
  };

  // Calculations
  const subtotal = cart?.subtotal || 0;

  let voucherDiscount = 0;
  if (activeVoucher) {
    if (activeVoucher.discountType === "FIXED") {
      voucherDiscount = activeVoucher.discountAmount; // use discountAmount calculated by backend validator
    } else {
      voucherDiscount = subtotal * (activeVoucher.discountValue / 100);
      if (activeVoucher.maxDiscount) {
        voucherDiscount = Math.min(voucherDiscount, activeVoucher.maxDiscount);
      }
    }
    voucherDiscount = Math.min(voucherDiscount, subtotal);
  }

  let promoDiscount = 0;
  const remainingSubtotal = subtotal - voucherDiscount;
  if (activePromo) {
    if (activePromo.discountType === "FIXED") {
      promoDiscount = activePromo.discountAmount; // use discountAmount calculated by backend validator
    } else {
      promoDiscount = remainingSubtotal * (activePromo.discountValue / 100);
      if (activePromo.maxDiscount) {
        promoDiscount = Math.min(promoDiscount, activePromo.maxDiscount);
      }
    }
    promoDiscount = Math.min(promoDiscount, remainingSubtotal);
  }

  const discountAmount = voucherDiscount + promoDiscount;
  const deliveryFee = deliveryOptions.find((o) => o.key === selectedMethod)?.fee || 0;
  const taxBase = Math.max(0, subtotal - discountAmount) + deliveryFee;
  const taxAmount = taxBase * 0.12; // 12% PPN
  const totalAmount = taxBase + taxAmount;

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Silakan pilih alamat pengiriman.");
      return;
    }

    if (wallet.balance < totalAmount) {
      toast.error("Saldo dompet tidak mencukupi. Silakan lakukan top up.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/buyer/checkout", {
        deliveryAddressId: selectedAddressId,
        deliveryMethod: selectedMethod,
        voucherCode: activeVoucher?.code || null,
        promoCode: activePromo?.code || null,
      });
      toast.success("Pesanan berhasil dibuat!");
      router.push(`/buyer/orders/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal melakukan checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat data checkout...</div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Keranjang Belanja Kosong</h2>
            <p className="text-zinc-500 font-light mb-6">Kembali ke halaman produk untuk mengisi keranjang belanja Anda.</p>
            <Link href="/products" className={cn(buttonVariants(), "bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg")}>
              Lihat Produk
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <Link href="/buyer/cart" className="text-zinc-400 hover:text-zinc-900 transition">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-zinc-950">Checkout</h1>
                <p className="text-zinc-500 text-sm font-light mt-0.5">Selesaikan pesanan Anda dengan memilih alamat dan pengiriman.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Selections Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Alamat Pengiriman */}
                <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-indigo-500" />
                      Alamat Pengiriman
                    </h2>
                    <Link href="/buyer/addresses" className="text-sm font-semibold text-indigo-600 hover:underline">
                      Kelola Alamat
                    </Link>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-6 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl">
                      <p className="text-sm text-zinc-500 font-light mb-3">Belum ada alamat pengiriman.</p>
                      <Link href="/buyer/addresses" className={cn(buttonVariants({ size: "sm" }), "bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg")}>
                        Tambah Alamat Baru
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={cn(
                            "flex items-start gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-zinc-50/50 transition-colors",
                            selectedAddressId === addr.id ? "border-indigo-500 bg-indigo-50/10" : "border-zinc-200"
                          )}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 h-4 w-4 rounded-full border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="text-sm text-zinc-700 font-light leading-relaxed">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-bold text-zinc-900">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md">
                                  Utama
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-zinc-800">{addr.recipientName} ({addr.phone})</p>
                            <p>{addr.addressLine}, {addr.city}, {addr.province} {addr.postalCode}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Voucher & Promo Promo */}
                <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-indigo-500" />
                    Kupon & Potongan Harga
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Store Voucher input */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Voucher Toko</label>
                      {activeVoucher ? (
                        <div className="flex items-center justify-between p-3 border border-indigo-150 bg-indigo-50/30 rounded-xl">
                          <div>
                            <p className="text-sm font-bold font-mono text-indigo-700">{activeVoucher.code}</p>
                            <p className="text-[10px] text-zinc-500 font-light mt-0.5">Potongan Rp {voucherDiscount.toLocaleString("id-ID")}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-500" onClick={() => { setActiveVoucher(null); setVoucherInput(""); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input placeholder="KODE VOUCHER TOKO" value={voucherInput} onChange={(e) => setVoucherInput(e.target.value)} className="rounded-lg border-zinc-200 uppercase font-mono bg-white" />
                          <Button variant="outline" onClick={handleValidateVoucher} className="rounded-lg border-zinc-200">Gunakan</Button>
                        </div>
                      )}
                    </div>

                    {/* Global Promo input */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Promo Global (Platform)</label>
                      {activePromo ? (
                        <div className="flex items-center justify-between p-3 border border-indigo-150 bg-indigo-50/30 rounded-xl">
                          <div>
                            <p className="text-sm font-bold font-mono text-indigo-700">{activePromo.code}</p>
                            <p className="text-[10px] text-zinc-500 font-light mt-0.5">Potongan Rp {promoDiscount.toLocaleString("id-ID")}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-500" onClick={() => { setActivePromo(null); setPromoInput(""); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input placeholder="KODE PROMO GLOBAL" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} className="rounded-lg border-zinc-200 uppercase font-mono bg-white" />
                          <Button variant="outline" onClick={handleValidatePromo} className="rounded-lg border-zinc-200">Gunakan</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Metode Pengiriman */}
                <Card className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-indigo-500" />
                    Pilih Pengiriman
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {deliveryOptions.map((opt) => (
                      <label
                        key={opt.key}
                        className={cn(
                          "flex flex-col justify-between p-4 border rounded-2xl cursor-pointer hover:bg-zinc-50/50 transition-colors",
                          selectedMethod === opt.key ? "border-indigo-500 bg-indigo-50/10" : "border-zinc-200"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-zinc-900 text-sm leading-tight">{opt.name}</span>
                          <input
                            type="radio"
                            name="delivery"
                            checked={selectedMethod === opt.key}
                            onChange={() => setSelectedMethod(opt.key as any)}
                            className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="text-xs text-zinc-400 font-light mt-1">
                          <p className="text-zinc-500 font-medium">{opt.desc}</p>
                          <p className="font-bold text-zinc-900 text-sm mt-2">Rp {opt.fee.toLocaleString("id-ID")}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Order Summary & Payment Column */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border border-zinc-200 bg-white rounded-3xl shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-bold text-zinc-950">Detail Pembayaran</h2>

                  {/* Summary lists */}
                  <div className="space-y-3 font-light text-sm text-zinc-500 border-b border-zinc-150 pb-4">
                    <div className="flex justify-between">
                      <span>Subtotal Belanja</span>
                      <span className="font-semibold text-zinc-900">Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>

                    {voucherDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Voucher Toko</span>
                        <span className="font-semibold">-Rp {voucherDiscount.toLocaleString("id-ID")}</span>
                      </div>
                    )}

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo Global</span>
                        <span className="font-semibold">-Rp {promoDiscount.toLocaleString("id-ID")}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Ongkos Kirim</span>
                      <span className="font-semibold text-zinc-900">Rp {deliveryFee.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PPN (12% Base)</span>
                      <span className="font-semibold text-zinc-900">Rp {taxAmount.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-zinc-700">Total Tagihan</span>
                    <span className="text-2xl font-extrabold text-zinc-950">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Wallet Check */}
                  <div className="border-t border-zinc-100 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-zinc-400 font-light flex items-center gap-1">
                        <Wallet className="h-3.5 w-3.5" />
                        Saldo SeaWallet Anda
                      </span>
                      <span className="text-sm font-bold text-zinc-900">
                        Rp {wallet?.balance?.toLocaleString("id-ID") || 0}
                      </span>
                    </div>

                    {wallet && wallet.balance < totalAmount ? (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-800 text-xs mt-3">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                        <div>
                          Saldo Anda kurang sebesar <strong className="font-bold">Rp {(totalAmount - wallet.balance).toLocaleString("id-ID")}</strong>. Silakan isi saldo untuk menyelesaikan transaksi.
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50/50 border border-green-150 p-2.5 rounded-xl">
                        <ShieldCheck className="h-4 w-4" />
                        Saldo mencukupi untuk pembayaran
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    {wallet && wallet.balance < totalAmount ? (
                      <Link
                        href="/buyer/wallet"
                        className={cn(buttonVariants(), "w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl py-6 flex items-center justify-center gap-1.5")}
                      >
                        Isi Saldo Wallet
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Button
                        onClick={handleCheckout}
                        disabled={submitting || !selectedAddressId}
                        className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl py-6 font-bold"
                      >
                        {submitting ? "Memproses Pesanan..." : "Konfirmasi Pembayaran"}
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
