"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star, ArrowRight, User, ShoppingBag, ShieldCheck, Truck, MessageSquare } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { isLoggedIn, getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { motion } from "framer-motion";
import RouteTimeline from "@/components/order/RouteTimeline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
} as const;

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setUser(isLoggedIn() ? getUser() : null);
    fetchReviews();
  }, []);

  useEffect(() => {
    if (user) {
      setReviewerName(user.username);
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) {
      toast.error("Nama dan ulasan tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/reviews", {
        reviewerName,
        rating,
        comment,
      });
      toast.success("Ulasan terkirim, terima kasih!");
      setComment("");
      setReviews((prev) => [res.data, ...prev]);
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Gagal mengirim ulasan.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRelativeDate = (dateStr: string) => {
    const diffTime = Math.abs(Date.now() - new Date(dateStr).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "hari ini";
    if (diffDays === 1) return "kemarin";
    return `${diffDays} hari lalu`;
  };

  // Mock timeline data for landing page preview
  const mockTimelineHistory = [
    { status: "SEDANG_DIKEMAS", note: "Menyiapkan pesanan di Gudang Senja", createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
    { status: "MENUNGGU_PENGIRIM", note: "Mencari kurir cargo", createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString() },
    { status: "SEDANG_DIKIRIM", note: "Driver Ojek mengarah ke alamat tujuan", createdAt: new Date(Date.now() - 1800000).toISOString() }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden bg-sea-deep py-20 sm:py-32"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 12px)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-cargo-amber ring-1 ring-inset ring-white/15">
              📦 Logistik & Marketplace Terintegrasi
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl font-display leading-tight">
              Satu Marketplace,<br />Setiap Rute Dilalui.
            </h1>
            <p className="text-white/80 text-base font-light leading-relaxed max-w-xl">
              Pembeli, Penjual, dan Pengemudi bertemu di satu platform — dari keranjang sampai depan pintu dengan transparansi manifest perjalanan.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-cargo-amber hover:bg-cargo-amber/90 text-white font-bold px-6 py-5 rounded-lg flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                Jelajahi Produk
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="/auth/register"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white font-bold px-6 py-5 rounded-lg transition-transform hover:scale-[1.02]"
                )}
              >
                Daftar Gratis
              </Link>
            </div>
          </motion.div>

          {/* Right visual: Tilted dummy route card */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, rotate: 0, scale: 0.95 }}
              animate={{ opacity: 1, rotate: -2, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="bg-sea-foam rounded-default border border-white/15 p-6 shadow-lift relative z-10"
            >
              <div className="bg-white rounded-lg border border-line p-4 shadow-card space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-role-seller/10 text-role-seller flex items-center justify-center font-bold text-xs">
                      KS
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-manifest-ink">Toko Kopi Senja</h4>
                      <p className="text-[10px] text-muted-foreground">Order #SP-883920</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold bg-sea-deep/10 text-sea-deep border-sea-deep/20 capitalize">
                    <Truck className="h-3 w-3" /> Sedang Dikirim
                  </span>
                </div>
                <hr className="border-t border-line" />
                <RouteTimeline 
                  statusHistory={mockTimelineHistory} 
                  currentStatus="SEDANG_DIKIRIM" 
                />
              </div>
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-tr from-cargo-amber/20 to-transparent rounded-default blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-sea-foam py-16 sm:py-24 border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-2"
          >
            <span className="text-xs uppercase tracking-wider font-semibold text-sea-mid">Penyedia Rute</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-manifest-ink sm:text-4xl font-display">
              Tiga Peran, Satu Rute Logistik
            </h2>
            <p className="text-muted-foreground font-light max-w-lg mx-auto text-sm">
              Semua peran didesain saling terhubung dan bersinergi demi mempercepat perpindahan barang.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Buyer Card */}
            <motion.div 
              variants={itemVariants} 
              whileHover={{ y: -4 }}
              className="flex transition-transform duration-300"
            >
              <Card className="border border-line bg-white rounded-default shadow-card flex flex-col justify-between p-6 transition-shadow hover:shadow-lift duration-300">
                <CardHeader className="p-0 mb-4">
                  <div className="h-10 w-10 bg-role-buyer/10 text-role-buyer rounded-lg flex items-center justify-center border border-role-buyer/20">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-manifest-ink mt-4 font-display">Alur Belanja Pembeli</CardTitle>
                  <CardDescription className="font-light mt-0.5 text-xs">Cari produk & bayar via e-wallet.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 text-xs text-muted-foreground leading-relaxed font-light flex-1">
                  Temukan barang lokal terbaik dari penjual terdekat. checkout menggunakan promo, dan bayar instan menggunakan saldo dompet terintegrasi. Pantau perjalanan paket Anda di timeline.
                </CardContent>
                <div className="mt-4 pt-4 border-t border-line">
                  <Link href="/products" className="text-xs font-semibold text-role-buyer hover:underline inline-flex items-center gap-1">
                    Jelajahi Produk &rarr;
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Seller Card */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="flex transition-transform duration-300"
            >
              <Card className="border border-line bg-white rounded-default shadow-card flex flex-col justify-between p-6 transition-shadow hover:shadow-lift duration-300">
                <CardHeader className="p-0 mb-4">
                  <div className="h-10 w-10 bg-role-seller/10 text-role-seller rounded-lg flex items-center justify-center border border-role-seller/20">
                    <User className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-manifest-ink mt-4 font-display">Manajemen Penjual</CardTitle>
                  <CardDescription className="font-light mt-0.5 text-xs">Buka warung atau kelola gudang.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 text-xs text-muted-foreground leading-relaxed font-light flex-1">
                  Mulai jualan online Anda, posting katalog barang, kelola persediaan stok secara real-time, proses pesanan masuk, dan terima pelunasan saldo langsung setelah pengiriman sukses.
                </CardContent>
                <div className="mt-4 pt-4 border-t border-line">
                  <Link href="/auth/register?role=SELLER" className="text-xs font-semibold text-role-seller hover:underline inline-flex items-center gap-1">
                    Mulai Jualan &rarr;
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Driver Card */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="flex transition-transform duration-300"
            >
              <Card className="border border-line bg-white rounded-default shadow-card flex flex-col justify-between p-6 transition-shadow hover:shadow-lift duration-300">
                <CardHeader className="p-0 mb-4">
                  <div className="h-10 w-10 bg-role-driver/10 text-role-driver rounded-lg flex items-center justify-center border border-role-driver/20">
                    <Truck className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-manifest-ink mt-4 font-display">Pekerjaan Pengemudi</CardTitle>
                  <CardDescription className="font-light mt-0.5 text-xs">Antar barang & peroleh upah.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 text-xs text-muted-foreground leading-relaxed font-light flex-1">
                  Ambil pekerjaan pengantaran kargo, kunjungi penjual untuk pick-up, lalu antarkan dengan aman ke pembeli. Nikmati komisi ongkir 100% yang masuk ke saldo Anda tanpa potongan.
                </CardContent>
                <div className="mt-4 pt-4 border-t border-line">
                  <Link href="/auth/register?role=DRIVER" className="text-xs font-semibold text-role-driver hover:underline inline-flex items-center gap-1">
                    Jadi Driver &rarr;
                  </Link>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-white py-16 sm:py-24" id="apa-kata-mereka">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="text-left space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-cargo-amber">Testimoni</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-manifest-ink font-display">
                Apa Kata Mereka
              </h2>
              <p className="text-muted-foreground font-light text-xs max-w-sm">
                Cerita dari mereka yang telah merasakan kemudahan logistik SEAPEDIA.
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger 
                render={
                  <Button className="bg-cargo-amber hover:bg-cargo-amber/90 text-white font-bold h-9 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer">
                    <MessageSquare className="h-4 w-4" />
                    Tulis Ulasan
                  </Button>
                }
              />
              <DialogContent className="bg-white text-manifest-ink border border-line rounded-default max-w-md p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-lg font-bold font-display text-sea-deep">Tulis Ulasan Baru</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">Berikan tanggapan jujur mengenai pengalaman Anda di platform.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Nama Lengkap
                    </label>
                    <Input
                      placeholder="Masukkan nama"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      disabled={!!user}
                      className="rounded-lg border-line bg-white h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Rating Bintang
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform active:scale-95"
                        >
                          <Star
                            className={cn(
                              "h-6 w-6 stroke-1.5",
                              star <= rating ? "text-cargo-amber fill-cargo-amber" : "text-line"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Pesan Ulasan
                    </label>
                    <textarea
                      placeholder="Ceritakan pengalaman bertransaksi Anda..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      maxLength={500}
                      className="w-full rounded-lg border border-line p-3 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-sea-mid transition"
                    ></textarea>
                    <span className="text-[10px] text-muted-foreground/60 text-right block mt-1">
                      {comment.length} / 500 karakter
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setDialogOpen(false)}
                      className="text-xs h-9"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-cargo-amber hover:bg-cargo-amber/90 text-white rounded-lg px-4 h-9 text-xs border-0"
                    >
                      {submitting ? "Mengirim..." : "Kirim Ulasan"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Reviews Carousel (Mobile Scroll Snap) or Grid (Desktop) */}
          {loadingReviews ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-xs text-muted-foreground animate-pulse font-mono">Memuat Manifest Ulasan...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border border-dashed border-line rounded-default text-xs font-light">
              Belum ada ulasan terdaftar. Jadilah yang pertama memberikan ulasan!
            </div>
          ) : (
            <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-snap-x md:overflow-visible">
              <div className="flex md:grid md:grid-cols-3 gap-6 w-max md:w-full">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="w-[280px] md:w-full scroll-snap-align-start border border-line rounded-default p-5 bg-white shadow-card flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="h-7 w-7 bg-sea-foam text-sea-deep rounded-full flex items-center justify-center text-[10px] font-bold">
                          {review.reviewerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-manifest-ink truncate">{review.reviewerName}</h4>
                          <p className="text-[10px] font-mono text-muted-foreground tabular-nums">
                            {getRelativeDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 mb-2.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={cn(
                              "h-3.5 w-3.5 stroke-1",
                              idx < review.rating ? "text-cargo-amber fill-cargo-amber" : "text-line"
                            )}
                          />
                        ))}
                      </div>
                      {/* Plain escaped comment text (no innerHTML) */}
                      <p className="text-xs text-muted-foreground font-light break-words leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
