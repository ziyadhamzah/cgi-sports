"use client";

import Link from "next/link";
import { Badge, Breadcrumbs, Button, EmptyState, SafeImage, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatDate, formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";

export default function NotifikasiPage() {
  const {
    ready,
    notifications,
    watched,
    resolveProduct,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    toast,
  } = useStore();

  if (!ready) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-zinc-400 md:px-8">Memuat notifikasi...</div>;
  }

  const unread = notifications.filter((item) => !item.read).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Notifikasi" }]} />
      <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Pemberitahuan"
          title="Notifikasi"
          description="Pantau kabar terbaru toko dan produk yang kamu ikuti."
        />
        <div className="flex flex-wrap gap-2">
          {unread > 0 && <Badge tone="accent">{unread} belum dibaca</Badge>}
          <Button
            variant="outline"
            size="sm"
            icon="check"
            disabled={unread === 0}
            onClick={() => {
              markAllNotificationsRead();
              toast("Semua notifikasi ditandai sudah dibaca.", "info");
            }}
          >
            Tandai semua dibaca
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon="trash"
            disabled={notifications.length === 0}
            onClick={() => {
              clearNotifications();
              toast("Notifikasi dikosongkan.", "info");
            }}
          >
            Hapus semua
          </Button>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="mb-5 text-sm font-semibold text-white">Daftar notifikasi</h2>
          {notifications.length === 0 ? (
            <EmptyState icon="bell" title="Belum ada notifikasi" description="Pemberitahuan tentang pesanan dan promo akan muncul di sini." />
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <article
                  key={item.id}
                  className={`surface-card rounded-2xl p-5 ${item.read ? "" : "border-[var(--accent)]/30 bg-[var(--accent)]/[0.03]"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.read ? "bg-white/5 text-zinc-400" : "bg-[var(--accent)]/15 text-[var(--accent)]"}`}>
                      <Icon name={item.read ? "check" : "bell"} size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                        {!item.read && <Badge tone="accent">Baru</Badge>}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{item.body}</p>
                      <p className="mt-2 text-[11px] text-zinc-500">{formatDate(item.at)}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {item.href && (
                          <Link href={item.href} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] transition hover:brightness-110">
                            Lihat detail <Icon name="arrow-right" size={13} />
                          </Link>
                        )}
                        {!item.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationRead(item.id)}
                            className="text-xs text-zinc-400 transition hover:text-white"
                          >
                            Tandai dibaca
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-5 text-sm font-semibold text-white">Produk yang dipantau</h2>
          {watched.length === 0 ? (
            <div className="surface-soft rounded-2xl px-5 py-10 text-center">
              <p className="text-sm text-zinc-400">Belum ada produk yang dipantau.</p>
              <Link href="/products" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                Jelajahi katalog <Icon name="arrow-right" size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {watched.map((entry) => {
                const product = resolveProduct(entry.id);
                return (
                  <article key={entry.id} className="surface-soft flex items-center gap-4 rounded-2xl p-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-800/60">
                      <SafeImage src={product?.image ?? entry.image} alt={entry.name} className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${entry.slug}`} className="line-clamp-1 text-sm font-medium text-white transition hover:text-[var(--accent)]">
                        {entry.name}
                      </Link>
                      <p className="mt-1 text-xs text-[var(--accent)]">{formatRupiah(product?.price ?? entry.price)}</p>
                    </div>
                    <Link href={`/products/${entry.slug}`} className="text-zinc-500 transition hover:text-white" aria-label={`Lihat ${entry.name}`}>
                      <Icon name="chevron-right" size={18} />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
