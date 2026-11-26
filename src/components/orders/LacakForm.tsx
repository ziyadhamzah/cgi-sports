"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import OrderTracking from "@/components/orders/OrderTracking";
import { Button, EmptyState, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { statusLabel } from "@/lib/catalog";
import { formatDate, formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";

export default function LacakForm() {
  const searchParams = useSearchParams();
  const urlTerm = ["no", "resi", "q"]
    .map((key) => searchParams.get(key) ?? "")
    .find((value) => value.trim().length > 0) ?? "";
  const [queryState, setQueryState] = useState<{ key: string; value: string } | null>(null);
  const { ready, allOrders } = useStore();

  const query = queryState && queryState.key === urlTerm ? queryState.value : urlTerm;
  const term = query.trim();
  const results = useMemo(() => {
    if (!term) return [];
    const needle = term.toLowerCase();
    return allOrders.filter((order) =>
      order.number.toLowerCase().includes(needle)
      || (order.resi?.toLowerCase().includes(needle) ?? false)
      || order.id.toLowerCase().includes(needle)
      || order.items.some((item) => item.name.toLowerCase().includes(needle)),
    );
  }, [allOrders, term]);

  if (!ready) {
    return <div className="surface-card rounded-3xl p-8 text-sm text-zinc-400">Memuat data pesanan...</div>;
  }

  return (
    <div>
      <form
        className="surface-card rounded-3xl p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setQueryState({ key: urlTerm, value: query.trim() });
        }}
      >
        <Field label="Nomor pesanan atau nomor resi" hint="Contoh: CGI-20261120-4821">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(event) => setQueryState({ key: urlTerm, value: event.target.value })}
              placeholder="Masukkan nomor pesanan atau resi"
              className={inputClass}
              aria-label="Nomor pesanan atau resi"
            />
            <Button type="submit" icon="search">Cari</Button>
          </div>
        </Field>
        <p className="mt-4 flex items-start gap-2 text-[11px] text-zinc-500">
          <Icon name="info" size={14} className="mt-0.5 shrink-0" />
          Pesanan demo tersedia dengan nomor CGI-20261120-4821.
        </p>
      </form>

      {!term && (
        <div className="mt-8">
          <EmptyState icon="search" title="Belum ada pencarian" description="Masukkan nomor pesanan atau resi untuk melihat status pengiriman." />
        </div>
      )}

      {term && results.length === 0 && (
        <div className="mt-8">
          <EmptyState icon="search" title="Pesanan tidak ditemukan" description={`Tidak ada pesanan yang cocok dengan "${term}". Periksa kembali nomor yang kamu masukkan.`} />
        </div>
      )}

      {results.map((order) => (
        <article key={order.id} className="mt-8 space-y-5">
          <div className="surface-card flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-white">{order.number}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-2 text-xs text-zinc-400">{statusLabel(order.status)} · {formatDate(order.createdAt)}</p>
              <p className="mt-1 text-xs text-zinc-500">{order.resi ? `Resi ${order.resi}` : "Resi tersedia setelah pembayaran"} · Total {formatRupiah(order.total)}</p>
            </div>
            <Button href={`/orders/${order.id}`} variant="outline" size="sm" icon="arrow-right">Lihat Detail</Button>
          </div>
          <OrderTracking order={order} />
        </article>
      ))}
    </div>
  );
}
