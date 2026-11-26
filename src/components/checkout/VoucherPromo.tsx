"use client";

import { useEffect, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { discountLabel, isVoucherExpired } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { vouchers } from "@/lib/mock-data";

type VoucherPromoProps = {
  onApply: (code: string) => void;
  appliedCode: string;
  claimedCodes?: string[];
};

export default function VoucherPromo({ onApply, appliedCode, claimedCodes }: VoucherPromoProps) {
  const [copiedCode, setCopiedCode] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1600);
    } catch {
      setCopiedCode("");
    }
  };

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {vouchers.map((voucher) => {
        const applied = voucher.code === appliedCode;
        const claimed = !claimedCodes || claimedCodes.includes(voucher.code);
        const expired = now > 0 && isVoucherExpired(voucher, now);
        return (
          <div
            key={voucher.code}
            className={`rounded-2xl border p-4 ${applied ? "border-[var(--accent)]/40 bg-[var(--accent)]/5" : "border-white/10 bg-white/[0.02]"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <Icon name="ticket" size={18} />
                <span className="font-semibold">{voucher.label}</span>
              </div>
              <Badge tone={expired ? "danger" : applied ? "success" : claimed ? "neutral" : "warning"}>
                {expired ? "Kedaluwarsa" : applied ? "Dipakai" : claimed ? discountLabel(voucher) : "Belum diklaim"}
              </Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-400">{voucher.description}</p>
            <p className="mt-1 text-xs text-zinc-500">Minimal belanja {formatRupiah(voucher.minSpend)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {expired ? (
                <Button size="sm" variant="secondary" disabled>Tidak tersedia</Button>
              ) : !claimed ? (
                <Button size="sm" variant="outline" icon="arrow-right" href="/promos">Klaim di Promo</Button>
              ) : (
                <Button size="sm" variant={applied ? "secondary" : "primary"} onClick={() => onApply(voucher.code)}>
                  {applied ? "Voucher aktif" : "Pakai voucher"}
                </Button>
              )}
              <Button size="sm" variant="outline" icon={copiedCode === voucher.code ? "check" : "copy"} onClick={() => copyCode(voucher.code)}>
                {copiedCode === voucher.code ? "Tersalin" : voucher.code}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
