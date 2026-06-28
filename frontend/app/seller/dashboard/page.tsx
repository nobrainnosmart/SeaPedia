"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SellerDashboard() {
  return (
    <ProtectedRoute allowedRole="SELLER">
      <DashboardLayout>
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-950 mb-2">Selamat Datang, Penjual!</h1>
          <p className="text-zinc-500 font-light leading-relaxed">
            Gunakan panel navigasi kiri untuk memperbarui profil Toko Saya, mengelola katalog produk (tambah, edit, hapus produk), melacak pesanan masuk dari pembeli, dan menganalisis ringkasan performa finansial toko Anda secara real-time.
          </p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
