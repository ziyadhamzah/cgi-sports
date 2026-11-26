"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import PaymentPanel from "@/components/checkout/PaymentPanel";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import OrderTracking from "@/components/orders/OrderTracking";
import { Badge, Breadcrumbs, Button, EmptyState, SafeImage, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { statusLabel } from "@/lib/catalog";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { paymentMethods } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";

function Loading() {
  return <div className="mx-auto max-w-5xl px-6 py-16 text-sm text-zinc-400">Memuat detail pesanan...</div>;
}

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { ready, allOrders, resolveProduct, updateOrderStatus, toast } = useStore();

  if (!ready) return <Loading />;

  const order = allOrders.find((item) => item.id === id);

  if (!order) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Pesanan", href: "/orders" }, { label: "Detail" }]} />
        <div className="mt-10">
          <EmptyState
            icon="package"
            title="Pesanan tidak ditemukan"
            description="Nomor pesanan yang kamu cari tidak tersedia di daftar pesanan."
            action={<Button href="/orders" icon="arrow-left">Kembali ke Pesanan</Button>}
          />
        </div>
      </div>
    );
  }

  const method = paymentMethods.find((item) => item.key === order.paymentMethod);
  const unpaid = order.status === "menunggu_pembayaran";
  const canComplete = order.status === "dikirim";

  const cancelOrder = () => {
    updateOrderStatus(order.id, "dibatalkan");
    toast("Pesanan dibatalkan.");
  };

  const completeOrder = () => {
    updateOrderStatus(order.id, "selesai");
    toast("Pesanan ditandai selesai.");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Pesanan", href: "/orders" }, { label: order.number }]} />
      <div className="mt-8">
        <SectionHeading eyebrow="Detail Pesanan" title={order.number} description={`Dibuat pada ${formatDateTime(order.createdAt)}.`} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <section className="surface-card rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Item Pesanan</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {order.resi ? `Resi: ${order.resi}` : "Resi dibuat setelah pembayaran dikonfirmasi"}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-6 divide-y divide-white/[0.06]">
            {order.items.map((item) => {
              const product = resolveProduct(item.productId);
              return (
                <div key={item.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
                    <SafeImage src={item.image} alt={item.name} sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={product ? `/products/${product.slug}` : "/products"} className="truncate text-sm font-medium text-white transition hover:text-[var(--accent)]">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-zinc-500">{item.quantity} x {formatRupiah(item.price)}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{formatRupiah(item.price * item.quantity)}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
            <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span className="text-white">{formatRupiah(order.subtotal)}</span></div>
            <div className="flex justify-between text-zinc-400"><span>Ongkir</span><span className="text-white">{formatRupiah(order.shippingFee)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-300"><span>Diskon {order.voucherCode ?? ""}</span><span>-{formatRupiah(order.discount)}</span></div>}
            <div className="flex items-end justify-between border-t border-white/10 pt-4"><span className="text-zinc-300">Total</span><span className="text-xl font-semibold text-[var(--accent)]">{formatRupiah(order.total)}</span></div>
          </div>
          {(unpaid || canComplete) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {unpaid && (
                <button
                  type="button"
                  onClick={cancelOrder}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-400/30 px-5 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/10"
                >
                  Batalkan Pesanan
                </button>
              )}
              {canComplete && <Button icon="check" onClick={completeOrder}>Tandai Selesai</Button>}
            </div>
          )}
        </section>

        <section className="surface-card h-fit rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Alamat & Pembayaran</h2>
          <div className="mt-5 space-y-5">
            <div className="flex gap-3">
              <Icon name="location" size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <div className="text-xs leading-6">
                <p className="font-semibold text-white">{order.customerName}</p>
                <p className="text-zinc-400">{order.phone}</p>
                <p className="text-zinc-400">{order.address}, {order.city} {order.postalCode}</p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-white/10 pt-5">
              <Icon name="shield" size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <div className="text-xs leading-6">
                <p className="font-semibold text-white">{method?.label ?? order.paymentMethod}</p>
                <p className="text-zinc-400">Status: {statusLabel(order.status)}</p>
                {order.paidAt && <p className="text-zinc-400">Dibayar: {formatDateTime(order.paidAt)}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
              <Badge tone="neutral"><Icon name="package" size={12} /> {order.items.length} produk</Badge>
              <Badge tone="neutral">{order.city}</Badge>
            </div>
          </div>
        </section>
      </div>

      {unpaid && <div className="mt-8"><PaymentPanel order={order} /></div>}
      <div className="mt-8"><OrderTracking order={order} /></div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrderDetailContent />
    </Suspense>
  );
}
