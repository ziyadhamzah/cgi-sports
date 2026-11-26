"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { discountLabel, isVoucherExpired } from "@/lib/catalog";
import { formatDate, formatRupiah } from "@/lib/format";
import { vouchers } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import { useSavedVoucher } from "@/lib/voucher";

type Filter = "semua" | "tersedia" | "terklaim";

const filters: { key: Filter; label: string }[] = [
  { key: "semua", label: "Semua voucher" },
  { key: "tersedia", label: "Belum diklaim" },
  { key: "terklaim", label: "Voucher saya" },
];

export default function VoucherCenter() {
  const router = useRouter();
  const { claimedVouchers, claimVoucher, toast } = useStore();
  const [savedVoucher, setSavedVoucher] = useSavedVoucher();
  const [filter, setFilter] = useState<Filter>("semua");
  const [copiedCode, setCopiedCode] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleVouchers = useMemo(() => vouchers.filter((voucher) => {
    const claimed = claimedVouchers.includes(voucher.code);
    if (filter === "tersedia") return !claimed && (now === 0 || !isVoucherExpired(voucher, now));
    if (filter === "terklaim") return claimed;
    return true;
  }), [claimedVouchers, filter, now]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1600);
    } catch {
      toast("Kode voucher tidak bisa disalin otomatis.", "error");
    }
  };

  const activateVoucher = (code: string) => {
    setSavedVoucher(code);
    toast("Voucher siap dipakai di keranjang.");
    router.push("/cart");
  };

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Pusat promo"
          title="Voucher siap dipakai"
          description="Klaim voucher favoritmu, lalu pakai saat checkout. Voucher yang diklaim tersimpan di browser ini."
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter voucher">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                filter === item.key
                  ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visibleVouchers.length === 0 ? (
        <div className="surface-card mt-8 rounded-3xl px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">Belum ada voucher di filter ini.</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Coba filter lain untuk melihat voucher yang tersedia.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleVouchers.map((voucher) => {
            const claimed = claimedVouchers.includes(voucher.code);
            const expired = now > 0 && isVoucherExpired(voucher, now);
            const applied = savedVoucher === voucher.code;
            return (
              <article
                key={voucher.code}
                className={`relative overflow-hidden rounded-3xl border p-5 ${
                  expired
                    ? "border-[var(--line)] bg-[var(--surface-soft)] opacity-70"
                    : claimed
                      ? "border-[var(--accent)]/35 bg-[var(--accent)]/5"
                      : "border-[var(--line)] bg-[var(--surface)]"
                }`}
              >
                <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border border-dashed border-[var(--accent)]/20" aria-hidden="true" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Icon name="ticket" size={20} />
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {voucher.badge && <Badge tone="accent">{voucher.badge}</Badge>}
                    <Badge tone={expired ? "danger" : claimed ? "success" : "neutral"}>
                      {expired ? "Kedaluwarsa" : claimed ? "Tersimpan" : "Tersedia"}
                    </Badge>
                  </div>
                </div>
                <p className="relative mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                  {discountLabel(voucher)}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{voucher.label}</p>
                <p className="mt-3 text-xs leading-6 text-[var(--muted)]">{voucher.description}</p>
                <div className="mt-4 space-y-1.5 text-xs text-[var(--muted)]">
                  <p className="flex items-center gap-2"><Icon name="cart" size={13} /> Minimal belanja {formatRupiah(voucher.minSpend)}</p>
                  {voucher.expiresAt && <p className="flex items-center gap-2"><Icon name="clock" size={13} /> Berlaku sampai {formatDate(voucher.expiresAt)}</p>}
                </div>
                <div className="relative mt-5 flex flex-wrap gap-2" aria-live="polite">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={copiedCode === voucher.code ? "check" : "copy"}
                    onClick={() => void copyCode(voucher.code)}
                  >
                    {copiedCode === voucher.code ? "Tersalin" : voucher.code}
                  </Button>
                  {expired ? (
                    <Button size="sm" variant="secondary" disabled>
                      Tidak tersedia
                    </Button>
                  ) : !claimed ? (
                    <Button size="sm" icon="plus" onClick={() => claimVoucher(voucher.code)}>
                      Klaim voucher
                    </Button>
                  ) : (
                    <Button size="sm" variant={applied ? "secondary" : "primary"} icon="arrow-right" onClick={() => activateVoucher(voucher.code)}>
                      {applied ? "Voucher aktif" : "Pakai di keranjang"}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
