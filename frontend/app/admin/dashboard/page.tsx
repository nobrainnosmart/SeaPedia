"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRole="ADMIN">
      <DashboardLayout>
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-950 mb-2">Admin Panel</h1>
          <p className="text-zinc-500 font-light leading-relaxed">
            Selamat datang di panel admin utama. Panel ini memberikan ringkasan total pengguna, toko, pesanan aktif, promosi voucher yang berjalan, pengiriman barang, serta penanganan pesanan terlambat (overdue) dengan simulasi travel time.
          </p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
