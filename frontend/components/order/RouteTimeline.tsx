"use client";

import { Package, Clock, Truck, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryItem {
  status: string;
  note?: string | null;
  createdAt: string;
}

interface RouteTimelineProps {
  statusHistory: HistoryItem[];
  currentStatus: string;
}

export default function RouteTimeline({ statusHistory = [], currentStatus }: RouteTimelineProps) {
  // Ensure history is sorted by date ascending
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getHistoryItem = (status: string) => {
    return sortedHistory.find((h) => h.status === status);
  };

  // Determine if order is returned
  const isReturned = currentStatus === "DIKEMBALIKAN" || sortedHistory.some(h => h.status === "DIKEMBALIKAN");

  // Define the standard route stops
  const stops = [
    {
      status: "SEDANG_DIKEMAS",
      label: "Dikemas",
      icon: Package,
    },
    {
      status: "MENUNGGU_PENGIRIM",
      label: "Siap Dikirim",
      icon: Clock,
    },
    {
      status: "SEDANG_DIKIRIM",
      label: "Dalam Pengiriman",
      icon: Truck,
    },
    {
      status: isReturned ? "DIKEMBALIKAN" : "PESANAN_SELESAI",
      label: isReturned ? "Dikembalikan" : "Selesai",
      icon: isReturned ? RotateCcw : CheckCircle2,
    },
  ];

  // Helper to check progress
  const currentStopIndex = stops.findIndex((s) => s.status === currentStatus);
  
  const getStopState = (status: string, index: number) => {
    const historyItem = getHistoryItem(status);
    const reached = !!historyItem;
    const isCurrent = status === currentStatus;
    
    // If not directly recorded in history, check if a subsequent step is reached
    let isPassed = false;
    if (reached && !isCurrent) {
      isPassed = true;
    } else {
      // Fallback index checking
      isPassed = currentStopIndex > index;
    }

    return { reached, isCurrent, isPassed, historyItem };
  };

  const formattedDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full bg-white border border-line rounded-default p-6 shadow-card">
      <style jsx global>{`
        @keyframes custom-ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .animate-ping-ring {
          animation: custom-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
      
      {/* Title / Header */}
      <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Manifest Perjalanan</span>
          <h4 className="font-display font-bold text-base text-sea-deep">Rute Pengiriman Cargo</h4>
        </div>
        <div className="font-mono text-xs text-muted-foreground tabular-nums">
          SLA: Aktif
        </div>
      </div>

      {/* Desktop View (Horizontal) */}
      <div className="hidden md:block relative my-6">
        {/* Connecting Lines Container */}
        <div className="absolute top-5 left-0 right-0 h-0.5 -translate-y-1/2 flex px-12">
          {stops.slice(0, -1).map((stop, i) => {
            const state = getStopState(stop.status, i);
            const nextState = getStopState(stops[i + 1].status, i + 1);
            const isLineActive = state.reached && (state.isPassed || nextState.reached);

            return (
              <div
                key={i}
                className={cn(
                  "flex-1 h-full transition-all duration-500",
                  isLineActive 
                    ? "bg-sea-mid" 
                    : "border-t-2 border-dashed border-line"
                )}
              />
            );
          })}
        </div>

        {/* Stops Row */}
        <div className="relative flex justify-between">
          {stops.map((stop, i) => {
            const { reached, isCurrent, isPassed, historyItem } = getStopState(stop.status, i);
            const StopIcon = stop.icon;

            return (
              <div key={stop.status} className="flex flex-col items-center w-32 text-center group">
                {/* Outer Circle & Icon */}
                <div className="relative flex items-center justify-center">
                  {/* Subtle Pulse Ring for Current Stop */}
                  {isCurrent && (
                    <div className={cn(
                      "absolute inset-0 rounded-full bg-cargo-amber/20 h-10 w-10 -m-1 pointer-events-none animate-ping-ring"
                    )} />
                  )}
                  
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300",
                      isCurrent && "bg-cargo-amber border-cargo-amber text-white shadow-md",
                      isPassed && "bg-sea-deep border-sea-deep text-white",
                      reached && !isCurrent && !isPassed && "bg-sea-mid border-sea-mid text-white",
                      !reached && "bg-white border-line text-muted-foreground"
                    )}
                  >
                    <StopIcon className="h-5 w-5 shrink-0" />
                  </div>
                </div>

                {/* Stop Info */}
                <span
                  className={cn(
                    "mt-3 text-xs font-semibold tracking-tight transition-colors",
                    isCurrent && "text-cargo-amber",
                    (isPassed || reached) && "text-manifest-ink",
                    !reached && "text-muted-foreground/60"
                  )}
                >
                  {stop.label}
                </span>

                {/* Timestamp */}
                {historyItem && (
                  <span className="mt-1 font-mono text-[10px] text-muted-foreground tabular-nums">
                    {formattedDate(historyItem.createdAt)}
                  </span>
                )}
                
                {/* Note for current / returned */}
                {isCurrent && historyItem?.note && (
                  <span className="mt-1.5 px-2 py-0.5 rounded-sm bg-cargo-amber/10 border border-cargo-amber/20 text-[10px] text-cargo-amber font-light max-w-[120px] truncate" title={historyItem.note}>
                    {historyItem.note}
                  </span>
                )}
                {stop.status === "DIKEMBALIKAN" && historyItem?.note && (
                  <span className="mt-1.5 px-2 py-0.5 rounded-sm bg-tide-coral/10 border border-tide-coral/20 text-[10px] text-tide-coral font-light max-w-[120px]" title={historyItem.note}>
                    {historyItem.note}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View (Vertical) */}
      <div className="md:hidden relative pl-8 space-y-8">
        {/* Connecting Vertical Line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-line">
          {/* We will overlay active lines manually using relative heights if needed, but a simple styled vertical step is standard and clean */}
        </div>

        {stops.map((stop, i) => {
          const { reached, isCurrent, isPassed, historyItem } = getStopState(stop.status, i);
          const StopIcon = stop.icon;

          return (
            <div key={stop.status} className="relative flex gap-4 items-start">
              {/* Vertical Step Circle */}
              <div className="absolute -left-[29px] top-0 flex items-center justify-center">
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full bg-cargo-amber/20 h-10 w-10 -m-1 pointer-events-none animate-ping-ring" />
                )}
                <div
                  className={cn(
                    "h-10 w-10 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300",
                    isCurrent && "bg-cargo-amber border-cargo-amber text-white shadow-md",
                    isPassed && "bg-sea-deep border-sea-deep text-white",
                    reached && !isCurrent && !isPassed && "bg-sea-mid border-sea-mid text-white",
                    !reached && "bg-white border-line text-muted-foreground"
                  )}
                >
                  <StopIcon className="h-5 w-5 shrink-0" />
                </div>
              </div>

              {/* Stop Description */}
              <div className="flex-1 min-h-[40px] pl-6 pt-1.5 flex flex-col">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-tight",
                      isCurrent && "text-cargo-amber",
                      (isPassed || reached) && "text-manifest-ink",
                      !reached && "text-muted-foreground/60"
                    )}
                  >
                    {stop.label}
                  </span>
                  
                  {historyItem && (
                    <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                      {formattedDate(historyItem.createdAt)}
                    </span>
                  )}
                </div>

                {/* Subtitle / Note */}
                {isCurrent && historyItem?.note && (
                  <p className="mt-1 text-[11px] text-cargo-amber font-light leading-snug">
                    {historyItem.note}
                  </p>
                )}
                {stop.status === "DIKEMBALIKAN" && historyItem?.note && (
                  <p className="mt-1 text-[11px] text-tide-coral font-semibold leading-snug bg-tide-coral/10 border border-tide-coral/20 p-2 rounded-sm">
                    Alasan: {historyItem.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
