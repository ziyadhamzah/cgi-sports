"use client";

import { Badge, Button } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { statusLabel, trackingStages } from "@/lib/catalog";
import { formatDate, formatDateTime } from "@/lib/format";
import { products } from "@/lib/mock-data";
import { openSellerChat } from "@/lib/seller-chat";
import { useStore } from "@/lib/store/StoreProvider";
import type { Order } from "@/lib/types";

const stageOffsets = [0, 15 * 60 * 1000, 24 * 60 * 60 * 1000, 72 * 60 * 60 * 1000];

export default function OrderTracking({ order }: { order: Order }) {
  const { resolveProduct } = useStore();
  const { stages, index } = trackingStages(order.status);
  const created = new Date(order.createdAt).getTime();
  const base = Number.isFinite(created) ? created : 0;
  const origin = products.find((product) => product.id === order.items[0]?.productId)?.city ?? "Jakarta Pusat";
  const eta = new Date(base + stageOffsets[stageOffsets.length - 1]);
  const canceled = order.status === "dibatalkan";
  const completed = order.status === "selesai";
  const tone: "danger" | "success" | "warning" | "accent" = canceled
    ? "danger"
    : completed
      ? "success"
      : order.status === "menunggu_pembayaran"
        ? "warning"
        : "accent";
  const progress = Math.max(0, index) / (stages.length - 1) * 100;
  const firstProduct = resolveProduct(order.items[0]?.productId ?? "");
  const sellerContext = {
    sellerId: firstProduct?.sellerId ?? "cgi",
    sellerSlug: firstProduct?.sellerSlug ?? "cgi-official-store",
    sellerName: firstProduct?.sellerName ?? "CGI Official Store",
    product: firstProduct
      ? { id: firstProduct.id, slug: firstProduct.slug, name: firstProduct.name, price: firstProduct.price, image: firstProduct.image }
      : undefined,
    orderNumber: order.number,
  };

  const askOrder = () => {
    window.dispatchEvent(new CustomEvent("cgi:open-chat", {
      detail: { prompt: `Lacak pesanan ${order.number}` },
    }));
    window.setTimeout(() => document.getElementById("chat-input")?.focus(), 0);
  };

  return (
    <section className="surface-card rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">Pelacakan Pesanan</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{statusLabel(order.status)}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">
            <Icon name="package" size={12} /> {order.resi ?? "Resi belum tersedia"}
            {order.courier ? ` · ${order.courier}` : ""}
          </Badge>
          <Badge tone={tone}>{canceled ? "Dibatalkan" : completed ? "Selesai" : "Dalam proses"}</Badge>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" icon="chat" onClick={askOrder}>
          Tanya pesanan
        </Button>
        <Button size="sm" variant="ghost" icon="store" onClick={() => openSellerChat(sellerContext)}>
          Chat penjual
        </Button>
      </div>

      <div className="relative mt-8">
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-white/10" />
        <div className="absolute left-0 top-3 h-0.5 bg-[var(--accent)]" style={{ width: `${progress}%` }} />
        <div className="relative grid grid-cols-4 gap-2">
          {stages.map((stage, stageIndex) => {
            const reached = !canceled && stageIndex <= index;
            return (
              <div key={stage.key} className="flex flex-col items-center text-center">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${reached ? "border-[var(--accent)] bg-[var(--accent)] text-[#0a0a0a]" : "border-white/15 bg-[var(--surface)] text-zinc-500"}`}>
                  {reached ? <Icon name="check" size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />}
                </div>
                <p className={`mt-2 text-[10px] leading-4 ${reached ? "text-zinc-200" : "text-zinc-500"}`}>{stage.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <div className="surface-soft flex items-start gap-3 rounded-2xl p-4">
          <Icon name="truck" size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          <div>
            <p className="text-xs font-medium text-white">Rute pengiriman</p>
            <p className="mt-1 text-xs text-zinc-400">Dari {origin} ke {order.city}</p>
          </div>
        </div>
        <div className="surface-soft flex items-start gap-3 rounded-2xl p-4">
          <Icon name="calendar" size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          <div>
            <p className="text-xs font-medium text-white">Estimasi pengiriman</p>
            <p className="mt-1 text-xs text-zinc-400">
              {canceled ? "Pengiriman dibatalkan." : completed ? "Pesanan selesai diterima." : `Perkiraan tiba ${formatDate(eta.toISOString())}.`}
            </p>
          </div>
        </div>
      </div>

      {canceled && <p className="mt-5 rounded-xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-xs text-rose-200">Pesanan dibatalkan. Pelacakan tidak berjalan.</p>}

      <ol className="mt-7">
        {stages.map((stage, stageIndex) => {
          const reached = !canceled && stageIndex <= index;
          const current = !canceled && stageIndex === index;
          const stamp = formatDateTime(new Date(base + stageOffsets[stageIndex]).toISOString());
          return (
            <li key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${reached ? "border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)]" : "border-white/10 bg-white/[0.03] text-zinc-500"}`}>
                  <Icon name={reached ? "check" : "clock"} size={14} />
                </div>
                {stageIndex < stages.length - 1 && <span className={`h-10 w-px ${stageIndex < index && !canceled ? "bg-[var(--accent)]/40" : "bg-white/10"}`} />}
              </div>
              <div className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`text-sm font-medium ${reached ? "text-white" : "text-zinc-500"}`}>{stage.label}</p>
                  {current && <Badge tone="accent">Saat ini</Badge>}
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">{canceled ? "Tidak tersedia" : reached ? stamp : `Perkiraan ${stamp}`}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
