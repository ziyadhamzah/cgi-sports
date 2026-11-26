"use client";

import { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { discountLabel } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { vouchers } from "@/lib/mock-data";

type VoucherPromoProps = {
  onApply: (code: string) => void;
  appliedCode: string;
};

export default function VoucherPromo({ onApply, appliedCode }: VoucherPromoProps) {
  const [copiedCode, setCopiedCode] = useState("");

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
              <Badge tone={applied ? "success" : "neutral"}>{applied ? "Dipakai" : discountLabel(voucher)}</Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-400">{voucher.description}</p>
            <p className="mt-1 text-[11px] text-zinc-500">Minimal belanja {formatRupiah(voucher.minSpend)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant={applied ? "secondary" : "primary"} onClick={() => onApply(voucher.code)}>
                {applied ? "Voucher aktif" : "Pakai voucher"}
              </Button>
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
