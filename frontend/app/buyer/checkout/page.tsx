"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, MapPin, Truck, Wallet, ShieldCheck, ArrowLeft, ArrowRight, Ticket, X, Check, Clock, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Price from "@/components/ui/Price";

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
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

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
    { key: "INSTANT", name: "Layanan Instan", fee: 25000, desc: "Tiba dalam 3 Jam", icon: Truck },
    { key: "NEXT_DAY", name: "Next Day", fee: 15000, desc: "Tiba Besok Hari", icon: Clock },
    { key: "REGULAR", name: "Reguler", fee: 9000, desc: "Tiba dalam 2-3 Hari", icon: Truck },
  ];

  // Validate Voucher
  const handleValidateVoucher = async () => {
    if (!voucherInput.trim()) return;
    setVoucherError(null);
    try {
      const res = await api.post("/discounts/validate", { code: voucherInput.trim().toUpperCase() });
      if (res.data.type !== "VOUCHER") {
        setVoucherError("Kode tersebut adalah kode Promo, gunakan di input Promo Global.");
        return;
      }
      setActiveVoucher(res.data);
      toast.success("Voucher toko berhasil dipasang!");
    } catch (err: any) {
      setVoucherError(err.response?.data?.error || "Gagal memvalidasi voucher.");
    }
  };

  // Validate Promo
  const handleValidatePromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError(null);
    try {
      const res = await api.post("/discounts/validate", { code: promoInput.trim().toUpperCase() });
      if (res.data.type !== "PROMO") {
        setPromoError("Kode tersebut adalah kode Voucher Toko, gunakan di input Voucher Toko.");
        return;
      }
      setActivePromo(res.data);
      toast.success("Promo global berhasil dipasang!");
    } catch (err: any) {
      setPromoError(err.response?.data?.error || "Gagal memvalidasi promo.");
    }
  };

  // Calculations
  const subtotal = cart?.subtotal || 0;

  let voucherDiscount = 0;
  if (activeVoucher) {
    if (activeVoucher.discountType === "FIXED") {
      voucherDiscount = activeVoucher.discountAmount;
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
      promoDiscount = activePromo.discountAmount;
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
          <div className="flex items-center justify-center py-20">
            <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Informasi Checkout...</span>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-line rounded-default max-w-md mx-auto shadow-card flex flex-col items-center">
            <h2 className="text-base font-bold font-display text-manifest-ink">Keranjang Belanja Kosong</h2>
            <p className="text-muted-foreground text-xs font-light mt-1 mb-6">Kembali ke halaman produk untuk mengisi keranjang belanja Anda.</p>
            <Link href="/products" className={cn(buttonVariants({ size: "sm" }), "bg-cargo-amber hover:bg-cargo-amber/90 text-white font-bold px-5 h-9 rounded-lg border-0")}>
              Lihat Produk
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Link href="/buyer/cart" className="text-muted-foreground hover:text-manifest-ink transition p-1 rounded hover:bg-sea-foam/40">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-sea-mid font-display">Operasional</span>
                <h1 className="text-2xl font-bold text-manifest-ink font-display mt-0.5">Checkout Pesanan</h1>
                <p className="text-muted-foreground text-xs font-light mt-0.5">Selesaikan pesanan Anda dengan melengkapi rute manifest.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Selections Column (Left 60%) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Alamat Pengiriman */}
                <Card className="border border-line bg-white rounded-default p-5 shadow-card">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-manifest-ink flex items-center gap-2 font-display">
                      <span className="h-5 w-5 rounded-full bg-sea-deep text-white font-mono text-xs flex items-center justify-center">1</span>
                      Alamat Pengiriman
                    </h2>
                    <Link href="/buyer/addresses" className="text-xs font-bold text-sea-mid hover:underline">
                      + Kelola Alamat
                    </Link>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-6 bg-sea-foam/10 border border-dashed border-line rounded-lg">
                      <p className="text-xs text-muted-foreground font-light mb-3">Belum ada alamat pengiriman terdaftar.</p>
                      <Link href="/buyer/addresses" className={cn(buttonVariants({ size: "sm" }), "bg-sea-mid text-white hover:bg-sea-mid/90 rounded-lg text-xs h-8")}>
                        Tambah Alamat Baru
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={cn(
                            "flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer hover:bg-sea-foam/5 transition-colors relative",
                            selectedAddressId === addr.id ? "border-sea-mid bg-sea-foam/10" : "border-line bg-white"
                          )}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-0.5 h-4.5 w-4.5 border-line text-sea-mid focus:ring-sea-mid cursor-pointer shrink-0"
                          />
                          <div className="text-xs text-muted-foreground font-light leading-relaxed min-w-0">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="font-bold text-manifest-ink text-xs">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] font-bold bg-cargo-amber/15 text-cargo-amber px-1.5 py-0.5 rounded border border-cargo-amber/10">
                                  Utama
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-manifest-ink">{addr.recipientName} &bull; <span className="font-mono">{addr.phone}</span></p>
                            <p className="truncate" title={addr.addressLine}>{addr.addressLine}</p>
                            <p>{addr.city}, {addr.province} {addr.postalCode}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </Card>

                {/* 2. Metode Pengiriman */}
                <Card className="border border-line bg-white rounded-default p-5 shadow-card">
                  <h2 className="text-sm font-bold text-manifest-ink flex items-center gap-2 mb-4 font-display">
                    <span className="h-5 w-5 rounded-full bg-sea-deep text-white font-mono text-xs flex items-center justify-center">2</span>
                    Metode Pengiriman Cargo
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {deliveryOptions.map((opt) => {
                      const MethodIcon = opt.icon;
                      const isSelected = selectedMethod === opt.key;
                      return (
                        <label
                          key={opt.key}
                          className={cn(
                            "flex flex-col justify-between p-3.5 border rounded-lg cursor-pointer hover:bg-sea-foam/5 transition-colors",
                            isSelected ? "border-sea-mid bg-sea-foam/10" : "border-line bg-white"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1 text-manifest-ink font-semibold">
                              <MethodIcon className="h-4 w-4 shrink-0 text-sea-mid" />
                              <span className="text-xs leading-none">{opt.name}</span>
                            </div>
                            <input
                              type="radio"
                              name="delivery"
                              checked={isSelected}
                              onChange={() => setSelectedMethod(opt.key as any)}
                              className="h-4.5 w-4.5 border-line text-sea-mid focus:ring-sea-mid cursor-pointer shrink-0"
                            />
                          </div>
                          <div className="text-[11px] text-muted-foreground font-light">
                            <p>{opt.desc}</p>
                            <div className="mt-2.5">
                              <Price amount={opt.fee} className="font-bold text-manifest-ink text-xs" />
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </Card>

                {/* 3. Kode Kupon & Promo */}
                <Card className="border border-line bg-white rounded-default p-5 shadow-card space-y-4">
                  <h2 className="text-sm font-bold text-manifest-ink flex items-center gap-2 font-display">
                    <span className="h-5 w-5 rounded-full bg-sea-deep text-white font-mono text-xs flex items-center justify-center">3</span>
                    Penerapan Kupon & Promo
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Store Voucher input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Voucher Toko</label>
                      {activeVoucher ? (
                        <div className="flex items-center justify-between p-2.5 border border-sea-mid/20 bg-sea-foam/10 rounded-lg">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold font-mono text-sea-mid">{activeVoucher.code}</p>
                              <span className="text-[9px] text-role-seller font-bold flex items-center gap-0.5 bg-role-seller/10 border border-role-seller/10 px-1 rounded">
                                <Check className="h-2.5 w-2.5" /> Terpasang
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-light">
                              Diskon: <Price amount={voucherDiscount} className="text-inherit font-semibold text-[10px]" />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded text-muted-foreground hover:text-tide-coral border-0" onClick={() => { setActiveVoucher(null); setVoucherInput(""); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Kode Voucher Toko" 
                            value={voucherInput} 
                            onChange={(e) => { setVoucherInput(e.target.value); setVoucherError(null); }} 
                            className="rounded-lg border-line bg-white h-8 text-xs uppercase font-mono" 
                          />
                          <Button variant="outline" size="sm" onClick={handleValidateVoucher} className="rounded-lg border-line h-8 text-xs shrink-0 font-semibold text-manifest-ink">Terapkan</Button>
                        </div>
                      )}
                      {voucherError && (
                        <p className="text-[10px] text-tide-coral font-light leading-snug">{voucherError}</p>
                      )}
                    </div>

                    {/* Global Promo input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Promo Platform (Global)</label>
                      {activePromo ? (
                        <div className="flex items-center justify-between p-2.5 border border-sea-mid/20 bg-sea-foam/10 rounded-lg">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold font-mono text-sea-mid">{activePromo.code}</p>
                              <span className="text-[9px] text-role-seller font-bold flex items-center gap-0.5 bg-role-seller/10 border border-role-seller/10 px-1 rounded">
                                <Check className="h-2.5 w-2.5" /> Terpasang
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 font-light">
                              Diskon: <Price amount={promoDiscount} className="text-inherit font-semibold text-[10px]" />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded text-muted-foreground hover:text-tide-coral border-0" onClick={() => { setActivePromo(null); setPromoInput(""); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Kode Promo Global" 
                            value={promoInput} 
                            onChange={(e) => { setPromoInput(e.target.value); setPromoError(null); }} 
                            className="rounded-lg border-line bg-white h-8 text-xs uppercase font-mono" 
                          />
                          <Button variant="outline" size="sm" onClick={handleValidatePromo} className="rounded-lg border-line h-8 text-xs shrink-0 font-semibold text-manifest-ink">Terapkan</Button>
                        </div>
                      )}
                      {promoError && (
                        <p className="text-[10px] text-tide-coral font-light leading-snug">{promoError}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Summary Column (Right 40%) */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="border border-line bg-white rounded-default shadow-card p-5 space-y-5 sticky top-20">
                  <h2 className="text-sm font-bold text-manifest-ink font-display uppercase tracking-wider text-muted-foreground pb-2 border-b border-line">
                    Detail Pembayaran
                  </h2>

                  {/* Pricing Rows */}
                  <div className="space-y-2.5 font-light text-xs text-muted-foreground border-b border-line pb-4">
                    <div className="flex justify-between">
                      <span>Subtotal Belanja</span>
                      <Price amount={subtotal} size="sm" className="font-bold text-manifest-ink" />
                    </div>

                    {voucherDiscount > 0 && (
                      <div className="flex justify-between text-role-seller font-semibold">
                        <span>Diskon Voucher Toko</span>
                        <span>- <Price amount={voucherDiscount} size="sm" className="text-inherit font-bold" /></span>
                      </div>
                    )}

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-role-seller font-semibold">
                        <span>Diskon Promo Global</span>
                        <span>- <Price amount={promoDiscount} size="sm" className="text-inherit font-bold" /></span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Ongkos Kirim ({selectedMethod})</span>
                      <Price amount={deliveryFee} size="sm" className="font-bold text-manifest-ink" />
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <span>PPN (12% Tarif Flat)</span>
                        <span className="text-[9px] text-muted-foreground/60 italic leading-none mt-0.5">
                          dihitung dari subtotal − diskon + ongkir
                        </span>
                      </div>
                      <Price amount={taxAmount} size="sm" className="font-bold text-manifest-ink" />
                    </div>
                  </div>

                  {/* Total Tagihan */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-manifest-ink font-display">TOTAL TAGIHAN</span>
                    <Price amount={totalAmount} size="2xl" className="font-bold text-sea-deep text-lg" />
                  </div>

                  {/* E-Wallet Balance Check */}
                  <div className="border-t border-line pt-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-light flex items-center gap-1.5">
                        <Wallet className="h-4.5 w-4.5 text-sea-mid shrink-0" />
                        Saldo SeaWallet Anda
                      </span>
                      <Price amount={wallet?.balance || 0} size="base" className="font-bold text-manifest-ink" />
                    </div>

                    {wallet && wallet.balance < totalAmount ? (
                      <>
                        <div className="p-3 bg-tide-coral/10 border border-tide-coral/20 rounded-lg text-xs text-tide-coral flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div className="leading-snug">
                            Saldo tidak mencukupi. Kurang sebesar <strong className="font-bold"><Price amount={totalAmount - wallet.balance} className="text-inherit text-xs" /></strong>. Top up dulu.
                          </div>
                        </div>
                        <Link
                          href="/buyer/wallet"
                          className={cn(
                            buttonVariants({ size: "sm" }),
                            "w-full bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold border-0 shadow-sm h-9"
                          )}
                        >
                          Isi Saldo Wallet
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 text-[11px] text-role-seller font-bold bg-role-seller/10 border border-role-seller/10 p-2.5 rounded-lg">
                          <ShieldCheck className="h-4 w-4 shrink-0" />
                          <span>Saldo SeaWallet mencukupi untuk checkout</span>
                        </div>
                        
                        <Button
                          onClick={handleCheckout}
                          disabled={submitting || !selectedAddressId}
                          className="w-full bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg py-5 flex items-center justify-center gap-1.5 text-xs font-bold border-0 shadow-sm h-10 cursor-pointer"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Membuat Pesanan...</span>
                            </>
                          ) : (
                            <span>Bayar Sekarang</span>
                          )}
                        </Button>
                      </>
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
