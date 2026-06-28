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
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [user, setUser] = useState<any>(null);

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
      toast.success("Ulasan berhasil dikirim!");
      setComment("");
      // Add new review to list
      setReviews((prev) => [res.data, ...prev].slice(0, 50));
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Gagal mengirim ulasan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-32">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.12, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-blue-400 blur-3xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.12, scale: 1 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
            className="absolute bottom-[-10%] right-[-20%] w-[600px] h-[600px] rounded-full bg-emerald-400 blur-3xl"
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="text-center"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-800 ring-1 ring-inset ring-zinc-200/50 mb-6"
            >
              🚀 Platform E-Commerce Terpadu
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 90 }}
              className="text-5xl font-extrabold tracking-tight text-zinc-950 sm:text-7xl max-w-4xl mx-auto leading-none bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-950 bg-clip-text text-transparent"
            >
              SEAPEDIA
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-lg leading-8 text-zinc-500 max-w-2xl mx-auto font-light"
            >
              Solusi perdagangan modern yang menghubungkan Pembeli, Penjual, dan Pengemudi dalam satu ekosistem yang transparan, aman, dan efisien.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Link
                href="/products"
                className={cn(buttonVariants({ size: "lg" }), "bg-zinc-950 hover:bg-zinc-900 text-white rounded-2xl px-8 py-6 text-base font-semibold flex items-center gap-2 shadow-lg shadow-zinc-950/10 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]")}
              >
                Jelajahi Produk
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-zinc-50/50 py-16 sm:py-24 border-y border-zinc-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              Tiga Peran, Satu Kemudahan
            </h2>
            <p className="mt-4 text-zinc-500 font-light max-w-xl mx-auto">
              Setiap pihak mendapatkan pengalaman terbaik yang disesuaikan dengan kebutuhan mereka.
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
              whileHover={{ y: -6, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
              className="flex"
            >
              <Card className="border border-zinc-200 bg-white rounded-3xl shadow-xs flex flex-col justify-between p-6 transition-all duration-300 hover:border-blue-200">
                <CardHeader className="p-0 mb-4">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold mt-4">Pengalaman Pembeli</CardTitle>
                  <CardDescription className="font-light mt-0.5">Belanja dengan aman dan mudah.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 text-sm text-zinc-500 leading-relaxed font-light flex-1">
                  Cari produk terbaik, tambahkan ke keranjang, dan lakukan pembayaran instan dengan saldo dompet digital Anda. Nikmati pelacakan pengiriman real-time dari driver kami.
                </CardContent>
              </Card>
            </motion.div>

            {/* Seller Card */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
              className="flex"
            >
              <Card className="border border-zinc-200 bg-white rounded-3xl shadow-xs flex flex-col justify-between p-6 transition-all duration-300 hover:border-green-200">
                <CardHeader className="p-0 mb-4">
                  <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold mt-4">Kedaulatan Penjual</CardTitle>
                  <CardDescription className="font-light mt-0.5">Kelola toko dan produk Anda sendiri.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 text-sm text-zinc-500 leading-relaxed font-light flex-1">
                  Buka toko Anda sendiri, unggah katalog produk secara instan, kelola persediaan barang, proses pesanan masuk, dan pantau laporan penjualan berkala.
                </CardContent>
              </Card>
            </motion.div>

            {/* Driver Card */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
              className="flex"
            >
              <Card className="border border-zinc-200 bg-white rounded-3xl shadow-xs flex flex-col justify-between p-6 transition-all duration-300 hover:border-orange-200">
                <CardHeader className="p-0 mb-4">
                  <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                    <Truck className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold mt-4">Pendapatan Pengemudi</CardTitle>
                  <CardDescription className="font-light mt-0.5">Dapatkan penghasilan dari setiap pengantaran.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 text-sm text-zinc-500 leading-relaxed font-light flex-1">
                  Cari pekerjaan pengiriman yang tersedia di sekitar Anda, konfirmasi pengambilan dari penjual, antarkan pesanan ke pembeli, dan raih komisi 100% dari ongkos kirim.
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Ulasan Pengguna
            </h2>
            <p className="mt-4 text-zinc-500 font-light max-w-xl mx-auto">
              Apa yang mereka katakan tentang kenyamanan bertransaksi di SEAPEDIA.
            </p>
          </div>

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="text-center text-zinc-400 py-6">Memuat ulasan...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-zinc-400 py-6 mb-12">Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16"
            >
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, shadow: "0 10px 20px -5px rgba(0, 0, 0, 0.05)" }}
                  className="border border-zinc-200 rounded-3xl p-6 bg-zinc-50 hover:bg-white hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 bg-zinc-200 text-zinc-700 rounded-full flex items-center justify-center text-xs font-semibold">
                        {review.reviewerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900">{review.reviewerName}</h4>
                        <p className="text-xs text-zinc-400">{new Date(review.createdAt).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-4 w-4 ${idx < review.rating ? "text-amber-400 fill-amber-400" : "text-zinc-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-zinc-500 font-light break-words leading-relaxed">{review.comment}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Add Review Form */}
          <div className="max-w-xl mx-auto bg-zinc-50 border border-zinc-200 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-zinc-700" />
              Tinggalkan Ulasan Anda
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Nama Anda
                </label>
                <Input
                  placeholder="Masukkan nama"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  disabled={!!user}
                  className="rounded-lg border-zinc-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-zinc-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Ulasan
                </label>
                <textarea
                  placeholder="Ceritakan pengalaman Anda..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-zinc-200 p-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-transparent transition"
                ></textarea>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg"
              >
                {submitting ? "Mengirim..." : "Kirim Ulasan"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
