"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Store, CheckCircle2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

export default function DriverHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/driver/history");
      setOrders(res.data);
    } catch (err) {
      toast.error("Gagal memuat riwayat pengiriman.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteJob = async (orderId: string) => {
    setCompletingId(orderId);
    try {
      await api.post(`/driver/jobs/${orderId}/complete`);
      toast.success("Pengiriman telah diselesaikan!");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menyelesaikan pengiriman.");
    } finally {
      setCompletingId(null);
    }
  };

  const activeOrders = orders.filter((o) => o.status === "SEDANG_DIKIRIM");
  const completedOrders = orders.filter((o) => o.status === "PESANAN_SELESAI" || o.status === "DIKEMBALIKAN");

  return (
    <ProtectedRoute allowedRole="DRIVER">
      <DashboardLayout>
        {loading ? (
          <div className="text-center py-12 text-zinc-500 animate-pulse">Memuat riwayat pekerjaan...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Pekerjaan Pengiriman Saya</h1>
              <p className="text-zinc-500 text-sm font-light mt-0.5">Kelola pesanan aktif yang sedang Anda kirim dan pantau pengiriman yang telah selesai.</p>
            </div>

            {/* Custom Tab Bar */}
            <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "active" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Aktif ({activeOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "completed" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Selesai ({completedOrders.length})
              </button>
            </div>

            {activeTab === "active" && (
              <div className="space-y-4">
                {activeOrders.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
                    <Navigation className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                    <p className="text-zinc-400 font-light">Tidak ada pengiriman aktif. Ambil pekerjaan di halaman Cari Pekerjaan!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeOrders.map((order) => (
                      <Card key={order.id} className="border border-zinc-200 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                            <div>
                              <p className="text-xs text-zinc-400 font-mono">ID: #{order.id.slice(-8).toUpperCase()}</p>
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20 mt-1.5">
                                Sedang Dikirim
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pendapatan</p>
                              <p className="text-base font-extrabold text-emerald-600">Rp {order.deliveryFee.toLocaleString("id-ID")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Store className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ambil Dari</p>
                              <p className="text-sm font-bold text-zinc-900">{order.store?.name}</p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <MapPin className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Kirim Ke</p>
                              <p className="text-sm font-bold text-zinc-900">{order.deliveryAddress?.recipientName}</p>
                              <p className="text-xs font-light text-zinc-500 mt-1 leading-relaxed">
                                {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.city}, {order.deliveryAddress?.province}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleCompleteJob(order.id)}
                          disabled={completingId !== null}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-bold flex items-center justify-center gap-1.5"
                        >
                          {completingId === order.id ? "Memproses..." : "Selesaikan Pengiriman (Sudah Diterima)"}
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "completed" && (
              <div className="space-y-4">
                {completedOrders.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                    <p className="text-zinc-400 font-light">Belum ada pengiriman yang diselesaikan.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            <th className="px-6 py-4">ID Pesanan</th>
                            <th className="px-6 py-4">Toko Pengirim</th>
                            <th className="px-6 py-4">Penerima</th>
                            <th className="px-6 py-4">Tarif Kurir</th>
                            <th className="px-6 py-4">Status Akhir</th>
                            <th className="px-6 py-4">Waktu Selesai</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150 text-sm text-zinc-700">
                          {completedOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-6 py-4 font-mono font-bold text-zinc-900">#{o.id.slice(-8).toUpperCase()}</td>
                              <td className="px-6 py-4 font-medium text-zinc-800">{o.store?.name}</td>
                              <td className="px-6 py-4">{o.deliveryAddress?.recipientName}</td>
                              <td className="px-6 py-4 font-bold text-emerald-600">Rp {o.deliveryFee.toLocaleString("id-ID")}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                                  o.status === "PESANAN_SELESAI"
                                    ? "bg-green-50 text-green-700 ring-green-600/20"
                                    : "bg-red-50 text-red-700 ring-red-600/20"
                                }`}>
                                  {o.status.replace("_", " ")}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-light text-zinc-500">
                                {new Date(o.updatedAt).toLocaleString("id-ID")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
