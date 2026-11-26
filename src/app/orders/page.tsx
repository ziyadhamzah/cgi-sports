"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { Button, EmptyState, SafeImage, SectionHeading, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { statusLabel } from "@/lib/catalog";
import { formatDate, formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";
import type { OrderStatus } from "@/lib/types";

type Filter = OrderStatus | "semua";

const filters: { key: Filter; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "menunggu_pembayaran", label: statusLabel("menunggu_pembayaran") },
  { key: "diproses", label: statusLabel("diproses") },
  { key: "dikirim", label: statusLabel("dikirim") },
  { key: "selesai", label: statusLabel("selesai") },
  { key: "dibatalkan", label: statusLabel("dibatalkan") },
];

export default function OrdersPage() {
  const { ready, allOrders } = useStore();
  const [filter, setFilter] = useState<Filter>("semua");
  const [query, setQuery] = useState("");

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();
    return allOrders.filter((order) => {
      if (filter !== "semua" && order.status !== filter) return false;
      if (!term) return true;
      return order.number.toLowerCase().includes(term)
        || (order.resi?.toLowerCase().includes(term) ?? false)
        || order.items.some((item) => item.name.toLowerCase().includes(term));
    });
  }, [allOrders, filter, query]);

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-zinc-400">Memuat pesanan...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <SectionHeading eyebrow="Pesanan" title="Pesanan kamu" description="Pantau status pembayaran dan pengiriman semua pesanan kamu di satu tempat." />

      <div className="mt-9 flex flex-col gap-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => {
            const count = item.key === "semua" ? allOrders.length : allOrders.filter((order) => order.status === item.key).length;
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition ${active ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]" : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"}`}
              >
                {item.label} ({count})
              </button>
            );
          })}
        </div>
        <div className="relative max-w-md">
          <Icon name="search" size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nomor pesanan atau produk"
            className={`${inputClass} pl-10`}
            aria-label="Cari pesanan"
          />
        </div>
      </div>

      <div className="mt-8">
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon="package"
            title={allOrders.length === 0 ? "Belum ada pesanan" : "Pesanan tidak ditemukan"}
            description={allOrders.length === 0 ? "Mulai belanja alat olahraga untuk membuat pesanan pertama kamu." : "Coba kata kunci atau filter status lain."}
            action={<Button href="/products" icon="arrow-right">Jelajahi Katalog</Button>}
          />
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="surface-card flex flex-col gap-4 rounded-3xl p-5 transition hover:border-white/25 sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                  <SafeImage src={order.items[0]?.image} alt={order.items[0]?.name ?? "Produk pesanan"} sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">{order.number}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-2 truncate text-xs text-zinc-400">
                    {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                  </p>
                  <p className="mt-2 text-[11px] text-zinc-500">{formatDate(order.createdAt)} · {order.city}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-[11px] text-zinc-500">Total</p>
                    <p className="text-sm font-semibold text-[var(--accent)]">{formatRupiah(order.total)}</p>
                  </div>
                  <Icon name="chevron-right" size={18} className="text-zinc-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
