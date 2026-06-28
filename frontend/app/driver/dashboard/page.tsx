"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DriverDashboard() {
  return (
    <ProtectedRoute allowedRole="DRIVER">
      <DashboardLayout>
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-950 mb-2">Selamat Datang, Pengemudi!</h1>
          <p className="text-zinc-500 font-light leading-relaxed">
            Mulai pekerjaan mengantar pesanan Anda dengan mencari pekerjaan pengiriman yang tersedia, melacak pekerjaan aktif Anda saat ini, atau meninjau total pendapatan yang telah Anda peroleh di platform.
          </p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
