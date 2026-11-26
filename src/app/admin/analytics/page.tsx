"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Badge, Breadcrumbs, Button, Field, SectionHeading, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";
import type { AnalyticsEvent } from "@/lib/types";

const eventLabels: Record<string, string> = {
  page_view: "Halaman dibuka",
  product_click: "Produk diklik",
  product_view: "Produk dilihat",
  add_to_cart: "Masuk keranjang",
  begin_checkout: "Mulai checkout",
  order_created: "Pesanan dibuat",
  payment_confirmed: "Pembayaran dikonfirmasi",
  order_completed: "Pesanan selesai",
  order_cancelled: "Pesanan dibatalkan",
};

function Bar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${width}%` }} />
    </div>
  );
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export default function AnalyticsPage() {
  const { ready, analytics, analyticsSummary, clearAnalytics, toast } = useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((data: { authenticated?: boolean }) => {
        if (active) setUnlocked(data.authenticated === true);
      })
      .catch(() => {
        if (active) setUnlocked(false);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => { active = false; };
  }, []);

  const recentEvents = useMemo(
    () => [...analytics].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 15),
    [analytics],
  );
  const topPages = useMemo(() => countBy(analytics.map((event) => event.path)).slice(0, 5), [analytics]);
  const topProducts = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const event of analytics) {
      if (!event.productId) continue;
      const current = counts.get(event.productId);
      counts.set(event.productId, {
        name: event.productName ?? "Produk",
        count: (current?.count ?? 0) + 1,
      });
    }
    return [...counts.entries()]
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [analytics]);

  const summaryCards = [
    { label: "Pengunjung", value: String(analyticsSummary.visitors), icon: "user" as const },
    { label: "Sesi", value: String(analyticsSummary.sessions), icon: "activity" as const },
    { label: "Tampilan halaman", value: String(analyticsSummary.pageViews), icon: "eye" as const },
    { label: "Tampilan produk", value: String(analyticsSummary.productViews), icon: "box" as const },
    { label: "Ditambahkan ke keranjang", value: String(analyticsSummary.addToCart), icon: "cart" as const },
    { label: "Pesanan dibuat", value: String(analyticsSummary.ordersCreated), icon: "package" as const },
    { label: "Pembayaran dikonfirmasi", value: String(analyticsSummary.paymentsConfirmed), icon: "check" as const },
    { label: "Pesanan selesai", value: String(analyticsSummary.ordersCompleted), icon: "shield" as const },
    { label: "Estimasi omzet", value: formatRupiah(analyticsSummary.revenue), icon: "chart" as const },
  ];

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json() as { authenticated?: boolean; error?: string };
      if (!response.ok || data.authenticated !== true) {
        setError(data.error ?? "Kata sandi salah. Coba lagi.");
        return;
      }
      setPassword("");
      setUnlocked(true);
    } catch {
      setError("Tidak dapat menghubungi server. Coba lagi.");
    }
  }

  async function handleLock() {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } catch {
      toast("Gagal mengakhiri sesi admin.", "error");
      return;
    }
    setUnlocked(false);
    toast("Sesi admin dikunci.", "info");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Analitik" }]} />
      <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Admin"
          title="Analitik toko"
          description="Pantau aktivitas pengunjung dan perilaku belanja dari data yang tersimpan di browser ini."
        />
        {unlocked && (
          <Button variant="outline" icon="logout" onClick={handleLock}>
            Kunci panel
          </Button>
        )}
      </div>

      {checking ? (
        <p className="mt-12 text-center text-sm text-zinc-400">Memeriksa sesi admin...</p>
      ) : !unlocked ? (
        <div className="mx-auto mt-12 max-w-md">
          <form onSubmit={handleUnlock} className="surface-card rounded-3xl p-6 md:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
              <Icon name="shield" size={21} />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-white">Panel admin terkunci</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Masukkan kata sandi admin demo untuk melihat statistik.</p>
            <div className="mt-6">
              <Field label="Kata sandi admin">
                <input
                  className={inputClass}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                />
              </Field>
            </div>
            {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
            <Button type="submit" icon="check" full className="mt-6">Buka panel</Button>
          </form>
        </div>
      ) : (
        <div className="mt-12 space-y-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map((card) => (
              <article key={card.label} className="surface-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-zinc-500">{card.label}</p>
                    <p className="mt-3 break-words text-2xl font-semibold text-white">{ready ? card.value : "-"}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Icon name={card.icon} size={17} />
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="surface-card rounded-3xl p-6">
              <h2 className="text-base font-semibold text-white">Halaman teratas</h2>
              {topPages.length === 0 ? (
                <p className="mt-5 text-sm text-zinc-500">Belum ada data kunjungan.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {topPages.map((page) => (
                    <div key={page.label}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                        <span className="truncate text-zinc-300">{page.label}</span>
                        <span className="shrink-0 text-zinc-500">{page.count}x</span>
                      </div>
                      <Bar value={page.count} max={topPages[0].count} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="surface-card rounded-3xl p-6">
              <h2 className="text-base font-semibold text-white">Produk teratas</h2>
              {topProducts.length === 0 ? (
                <p className="mt-5 text-sm text-zinc-500">Belum ada interaksi produk.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.id}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                        <span className="truncate text-zinc-300">{product.name}</span>
                        <span className="shrink-0 text-zinc-500">{product.count}x</span>
                      </div>
                      <Bar value={product.count} max={topProducts[0].count} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="surface-card overflow-hidden rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-white">Aktivitas terbaru</h2>
                <p className="mt-1 text-xs text-zinc-500">{analyticsSummary.totalEvents} peristiwa tercatat</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                icon="trash"
                disabled={analytics.length === 0}
                onClick={() => {
                  clearAnalytics();
                  toast("Data analitik berhasil dihapus.", "info");
                }}
              >
                Hapus data
              </Button>
            </div>
            {recentEvents.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-zinc-500">Belum ada aktivitas yang tercatat.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-white/[0.02] text-zinc-500 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-medium">Waktu</th>
                      <th className="px-4 py-4 font-medium">Peristiwa</th>
                      <th className="px-4 py-4 font-medium">Halaman</th>
                      <th className="px-4 py-4 font-medium">Produk</th>
                      <th className="px-6 py-4 font-medium">Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {recentEvents.map((event: AnalyticsEvent) => (
                      <tr key={event.id} className="text-zinc-300">
                        <td className="whitespace-nowrap px-6 py-4 text-zinc-500">{formatDateTime(event.at)}</td>
                        <td className="px-4 py-4">
                          <Badge tone="neutral">{eventLabels[event.type] ?? event.type}</Badge>
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-4">{event.path}</td>
                        <td className="max-w-[220px] truncate px-4 py-4">{event.productName ?? "-"}</td>
                        <td className="whitespace-nowrap px-6 py-4">{event.amount !== undefined ? formatRupiah(event.amount) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
