"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-sea-deep text-white border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <rect x="2" y="6" width="16" height="12" rx="2" fill="#E8923C" />
                <rect x="10" y="10" width="16" height="12" rx="2" fill="white" stroke="#0B3D44" strokeWidth="2" />
              </svg>
              <span className="text-lg font-display font-bold tracking-tight text-white">
                SEAPEDIA
              </span>
            </div>
            <p className="text-white/70 text-xs font-light leading-relaxed max-w-sm">
              Marketplace multi-peran pertama di Indonesia. Mengintegrasikan pembeli, penjual warung/gudang, dan pengemudi kurir dalam satu rute logistik yang lancar dan tepercaya.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-cargo-amber">Untuk Pengguna</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/register?role=SELLER" className="text-xs text-white/70 hover:text-white transition font-light">
                  Mulai Jualan (Jadi Penjual)
                </Link>
              </li>
              <li>
                <Link href="/auth/register?role=DRIVER" className="text-xs text-white/70 hover:text-white transition font-light">
                  Mulai Mengantar (Jadi Driver)
                </Link>
              </li>
              <li>
                <Link href="/#bantuan" className="text-xs text-white/70 hover:text-white transition font-light">
                  Pusat Bantuan & Layanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Security */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-cargo-amber">Kepercayaan & Keamanan</h4>
            <p className="text-white/70 text-xs font-light leading-relaxed">
              Seluruh data transaksi, otorisasi peran, pembaruan saldo dompet, dan penanganan status overdue dienkripsi dan diproses secara otomatis melalui sistem logistik modern yang aman.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-white/50 font-light">
            &copy; 2026 SEAPEDIA &mdash; Dibangun untuk COMPFEST
          </span>
          <span className="text-xs text-white/40 font-light italic">
            Marketplace yang menghubungkan setiap pihak dalam satu rute.
          </span>
        </div>
      </div>
    </footer>
  );
}
