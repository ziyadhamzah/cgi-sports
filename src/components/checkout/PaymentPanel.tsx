"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatRupiah } from "@/lib/format";
import { paymentMethods } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import type { Order } from "@/lib/types";

const PAYMENT_WINDOW = 15 * 60 * 1000;

function hashValue(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function referenceNumber(order: Order) {
  const method = paymentMethods.find((item) => item.key === order.paymentMethod);
  const digits = String(hashValue(order.id)).padStart(10, "0").slice(0, 10);
  if (method?.kind === "va") {
    const prefixes: Record<string, string> = { bca: "5270", mandiri: "008", bni: "009", bri: "002" };
    return `${prefixes[order.paymentMethod] ?? "8808"}${digits}`;
  }
  if (method?.kind === "ewallet") return `08${digits.slice(0, 9)}`;
  return `QRIS-${digits.slice(0, 6)}`;
}

function inFinderArea(x: number, y: number) {
  return (x <= 7 && y <= 7) || (x >= 13 && y <= 7) || (x <= 7 && y >= 13);
}

function qrCells(seed: number) {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < 21; y += 1) {
    for (let x = 0; x < 21; x += 1) {
      if (inFinderArea(x, y)) continue;
      let value = (seed ^ Math.imul(x + 1, 73856093) ^ Math.imul(y + 1, 19349663)) >>> 0;
      value = Math.imul(value ^ (value >>> 15), 2246822519) >>> 0;
      if ((value >>> 9) % 100 < 42) cells.push({ x, y });
    }
  }
  return cells;
}

function QrisPattern({ seed }: { seed: number }) {
  const cells = useMemo(() => qrCells(seed), [seed]);
  const finders = [
    [0, 0],
    [14, 0],
    [0, 14],
  ];
  return (
    <svg
      viewBox="0 0 21 21"
      role="img"
      aria-label="Pola QRIS untuk pembayaran"
      shapeRendering="crispEdges"
      className="h-44 w-44 rounded-2xl bg-white p-1 text-black"
    >
      <rect x={0} y={0} width={21} height={21} fill="white" />
      {cells.map(({ x, y }) => <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />)}
      {finders.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={7} height={7} fill="currentColor" />
          <rect x={x + 1} y={y + 1} width={5} height={5} fill="white" />
          <rect x={x + 2} y={y + 2} width={3} height={3} fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

export default function PaymentPanel({ order }: { order: Order }) {
  const { updateOrderStatus, toast } = useStore();
  const [remaining, setRemaining] = useState(15 * 60);

  useEffect(() => {
    const update = () => {
      const created = new Date(order.createdAt).getTime();
      const deadline = Number.isFinite(created) ? created + PAYMENT_WINDOW : Date.now() + PAYMENT_WINDOW;
      setRemaining(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [order.createdAt]);

  const method = paymentMethods.find((item) => item.key === order.paymentMethod);
  const reference = referenceNumber(order);
  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      toast("Nomor pembayaran disalin.");
    } catch {
      toast("Gagal menyalin nomor pembayaran.", "error");
    }
  };

  const confirmPayment = () => {
    if (remaining <= 0) {
      toast("Waktu pembayaran habis. Buat pesanan baru untuk melanjutkan.", "error");
      return;
    }
    updateOrderStatus(order.id, "diproses");
    toast("Pembayaran demo dikonfirmasi. Nomor resi telah dibuat.");
  };

  return (
    <section className="surface-card rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">Pembayaran</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{method?.label ?? "Metode Pembayaran"}</h3>
          <p className="mt-1 text-xs text-zinc-400">{method?.description ?? "Selesaikan pembayaran pesanan kamu."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="warning">Mode demo</Badge>
          <Badge tone={remaining > 0 ? "warning" : "danger"}>
            <Icon name="clock" size={12} />
            {remaining > 0 ? `Sisa ${minutes}:${seconds}` : "Waktu habis"}
          </Badge>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start">
        {method?.kind === "qris" ? (
          <div className="flex shrink-0 flex-col items-center gap-3">
            <QrisPattern seed={hashValue(order.id)} />
            <p className="text-center text-xs text-zinc-400">Pola QRIS demo, bukan kode pembayaran valid</p>
          </div>
        ) : (
          <div className="flex min-w-[260px] flex-col items-start rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-zinc-400">
              <Icon name="copy" size={16} />
              <span className="text-xs">Nomor pembayaran</span>
            </div>
            <p className="mt-3 break-all font-mono text-xl font-semibold tracking-wide text-white">{reference}</p>
            <p className="mt-2 text-xs text-zinc-500">Transfer sesuai nominal total pesanan.</p>
          </div>
        )}

        <div className="flex-1 space-y-4">
          <div className="surface-soft rounded-2xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Nomor pesanan</span>
              <span className="font-medium text-white">{order.number}</span>
            </div>
            <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-zinc-300">Total pembayaran</span>
              <span className="text-xl font-semibold text-[var(--accent)]">{formatRupiah(order.total)}</span>
            </div>
          </div>
          <div className="space-y-2 text-xs text-zinc-400">
            <p className="flex items-start gap-2"><Icon name="shield" size={14} className="mt-0.5 shrink-0" /> Pembayaran disimulasikan. Tidak ada dana yang dipindahkan.</p>
            <p className="flex items-start gap-2"><Icon name="clock" size={14} className="mt-0.5 shrink-0" /> Konfirmasi dalam 15 menit sejak pesanan dibuat.</p>
            <p className="flex items-start gap-2"><Icon name="info" size={14} className="mt-0.5 shrink-0" /> Tombol konfirmasi hanya untuk mencoba alur pesanan.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" icon="copy" onClick={copyReference}>Salin Nomor Demo</Button>
            <Button icon="check" onClick={confirmPayment} disabled={remaining <= 0}>
              {remaining <= 0 ? "Waktu Habis" : "Konfirmasi Pembayaran Demo"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
