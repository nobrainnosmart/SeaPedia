"use client";

import { User, Store, Truck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: "BUYER" | "SELLER" | "DRIVER" | "ADMIN" | string;
  className?: string;
}

export default function RoleBadge({ role, className }: RoleBadgeProps) {
  let bgClass = "";
  let Icon = User;
  let label = role;

  switch (role) {
    case "BUYER":
      bgClass = "bg-role-buyer/10 text-role-buyer border-role-buyer/20";
      Icon = User;
      label = "Pembeli";
      break;
    case "SELLER":
      bgClass = "bg-role-seller/10 text-role-seller border-role-seller/20";
      Icon = Store;
      label = "Penjual";
      break;
    case "DRIVER":
      bgClass = "bg-role-driver/10 text-role-driver border-role-driver/20";
      Icon = Truck;
      label = "Driver";
      break;
    case "ADMIN":
      bgClass = "bg-role-admin/10 text-role-admin border-role-admin/20";
      Icon = ShieldCheck;
      label = "Admin";
      break;
    default:
      bgClass = "bg-muted text-muted-foreground border-muted";
      Icon = User;
      label = role;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-[11px] font-semibold tracking-wide capitalize",
        bgClass,
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
