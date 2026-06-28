"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function BuyerDashboard() {
  return (
    <ProtectedRoute allowedRole="BUYER">
      <DashboardLayout>
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-950 mb-2">Selamat Datang, Pembeli!</h1>
          <p className="text-zinc-500 font-light leading-relaxed">
            Gunakan menu di sebelah kiri untuk mengelola saldo dompet digital Anda, melihat alamat pengiriman, mengelola keranjang belanjaan, melacak status pesanan Anda saat ini, atau mengecek riwayat pembelian Anda.
          </p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
