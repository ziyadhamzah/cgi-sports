"use client";

import { Badge } from "@/components/ui";
import { statusLabel } from "@/lib/catalog";
import type { OrderStatus } from "@/lib/types";

const tones: Record<OrderStatus, "accent" | "success" | "warning" | "danger" | "neutral"> = {
  menunggu_pembayaran: "warning",
  diproses: "accent",
  dikirim: "accent",
  selesai: "success",
  dibatalkan: "danger",
};

const dots: Record<OrderStatus, string> = {
  menunggu_pembayaran: "bg-amber-300",
  diproses: "bg-[var(--accent)]",
  dikirim: "bg-[var(--accent)]",
  selesai: "bg-emerald-300",
  dibatalkan: "bg-rose-300",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={tones[status]}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {statusLabel(status)}
    </Badge>
  );
}
