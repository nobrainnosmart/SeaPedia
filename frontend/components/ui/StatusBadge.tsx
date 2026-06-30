"use client";

import { Package, Clock, Truck, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus =
  | "SEDANG_DIKEMAS"
  | "MENUNGGU_PENGIRIM"
  | "SEDANG_DIKIRIM"
  | "PESANAN_SELESAI"
  | "DIKEMBALIKAN";

interface StatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  let bgClass = "";
  let Icon = Package;
  let label = status;

  switch (status) {
    case "SEDANG_DIKEMAS":
      bgClass = "bg-cargo-amber/10 text-cargo-amber border-cargo-amber/20";
      Icon = Package;
      label = "Sedang Dikemas";
      break;
    case "MENUNGGU_PENGIRIM":
      bgClass = "bg-sea-mid/10 text-sea-mid border-sea-mid/20";
      Icon = Clock;
      label = "Menunggu Pengirim";
      break;
    case "SEDANG_DIKIRIM":
      bgClass = "bg-sea-deep/10 text-sea-deep border-sea-deep/20";
      Icon = Truck;
      label = "Sedang Dikirim";
      break;
    case "PESANAN_SELESAI":
      bgClass = "bg-role-seller/10 text-role-seller border-role-seller/20";
      Icon = CheckCircle2;
      label = "Pesanan Selesai";
      break;
    case "DIKEMBALIKAN":
      bgClass = "bg-tide-coral/10 text-tide-coral border-tide-coral/20";
      Icon = RotateCcw;
      label = "Dikembalikan";
      break;
    default:
      bgClass = "bg-muted text-muted-foreground border-muted";
      Icon = Package;
      label = typeof status === "string" ? status.replace(/_/g, " ") : status;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold tracking-wide capitalize",
        bgClass,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
