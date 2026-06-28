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

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <span className="inline-flex items-center rounded-md bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-900 ring-1 ring-inset ring-zinc-600/10 mb-6">
              Platform E-Commerce Terpadu
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl max-w-4xl mx-auto leading-none">
              SEAPEDIA
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 max-w-2xl mx-auto font-light">
              Solusi perdagangan modern yang menghubungkan Pembeli, Penjual, dan Pengemudi dalam satu ekosistem yang transparan dan efisien.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/products"
                className={cn(buttonVariants({ size: "lg" }), "bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl px-6 py-6 text-base flex items-center gap-2")}
              >
                Jelajahi Produk
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-zinc-50 py-16 sm:py-24 border-y border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Tiga Peran, Satu Kemudahan
            </h2>
            <p className="mt-4 text-zinc-500 font-light max-w-xl mx-auto">
              Setiap pihak mendapatkan pengalaman terbaik yang disesuaikan dengan kebutuhan mereka.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Buyer Card */}
            <Card className="border border-zinc-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Pengalaman Pembeli</CardTitle>
                <CardDescription className="font-light">Belanja dengan aman dan mudah.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-600 leading-relaxed font-light">
                Cari produk terbaik, tambahkan ke keranjang, dan lakukan pembayaran instan dengan saldo dompet digital Anda. Nikmati pelacakan pengiriman real-time dari driver kami.
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card className="border border-zinc-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <CardHeader>
                <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                  <User className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Kedaulatan Penjual</CardTitle>
                <CardDescription className="font-light">Kelola toko dan produk Anda sendiri.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-600 leading-relaxed font-light">
                Buka toko Anda sendiri, unggah katalog produk secara instan, kelola persediaan barang, proses pesanan masuk, dan pantau laporan penjualan berkala.
              </CardContent>
            </Card>

            {/* Driver Card */}
            <Card className="border border-zinc-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <CardHeader>
                <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold">Pendapatan Pengemudi</CardTitle>
                <CardDescription className="font-light">Dapatkan penghasilan dari setiap pengantaran.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-600 leading-relaxed font-light">
                Cari pekerjaan pengiriman yang tersedia di sekitar Anda, konfirmasi pengambilan dari penjual, antarkan pesanan ke pembeli, dan raih komisi 70% dari ongkos kirim.
              </CardContent>
            </Card>
          </div>
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
              {reviews.map((review) => (
                <div key={review.id} className="border border-zinc-200 rounded-2xl p-6 bg-zinc-50 hover:bg-zinc-100/50 transition">
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
                  <p className="text-sm text-zinc-600 font-light break-words">{review.comment}</p>
                </div>
              ))}
            </div>
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
