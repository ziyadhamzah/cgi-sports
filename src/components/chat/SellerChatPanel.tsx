"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Badge, SafeImage } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { sellerChatGreeting, sellerChatKey } from "@/lib/seller-chat";
import { useStore } from "@/lib/store/StoreProvider";
import type { SellerChatContext, SellerChatMessage } from "@/lib/types";

export default function SellerChatPanel() {
  const { sellerChats, sendSellerChat, clearSellerChat } = useStore();
  const [context, setContext] = useState<SellerChatContext | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<SellerChatContext>).detail;
      if (!detail?.sellerId) return;
      setContext(detail);
      setOpen(true);
    };
    window.addEventListener("cgi:open-seller-chat", handler);
    return () => window.removeEventListener("cgi:open-seller-chat", handler);
  }, []);

  const key = useMemo(() => context ? sellerChatKey(context) : "", [context]);
  const stored = key ? sellerChats[key] ?? [] : [];
  const messages: SellerChatMessage[] = context && stored.length === 0
    ? [{ id: `greeting-${key}`, key, sellerName: context.sellerName, role: "seller", text: sellerChatGreeting(context), at: "" }]
    : stored;

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "end" });
    return () => window.clearTimeout(timer);
  }, [open, messages.length]);

  const quickPrompts = context?.product
    ? ["Stok ready?", "Bisa kirim hari ini?", "Ada diskon?", "Ukuran tersedia?"]
    : ["Produk apa yang ready?", "Ongkir ke Bandung?", "Ada voucher?"];

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!context || !trimmed) return;
    sendSellerChat(context, trimmed);
    setInput("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(input);
  };

  if (!open || !context) return null;

  return (
    <section
      id="seller-chat-panel"
      className="fixed bottom-20 right-5 z-[100] flex max-h-[min(520px,calc(100vh-8rem))] w-[min(390px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-[var(--accent)]/30 bg-[var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
      aria-label={`Chat ${context.sellerName}`}
    >
      <div className="flex items-center gap-3 border-b border-[var(--accent)]/20 bg-[var(--accent)]/10 px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent)]/40 bg-[var(--background)] text-[var(--accent)]">
          <Icon name="store" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">{context.sellerName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Online · Biasanya balas cepat
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearSellerChat(key);
            setInput("");
          }}
          className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--accent)]"
          aria-label="Hapus percakapan"
        >
          <Icon name="refresh" size={15} />
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
          aria-label="Tutup chat penjual"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {context.product && (
        <div className="border-b border-[var(--line)] bg-[var(--background)] px-4 py-3">
          <Link
            href={context.product.slug ? `/products/${context.product.slug}` : "/products"}
            className="flex items-center gap-3 rounded-2xl border border-[var(--line)] p-2 transition hover:border-[var(--accent)]/40"
          >
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/5">
              {context.product.image ? (
                <SafeImage src={context.product.image} alt="" fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[var(--muted)]"><Icon name="box" size={16} /></span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-[var(--foreground)]">{context.product.name}</span>
              <span className="mt-0.5 block text-[11px] text-[var(--accent)]">{formatRupiah(context.product.price)}</span>
            </span>
            <Icon name="chevron-right" size={14} className="text-[var(--muted)]" />
          </Link>
        </div>
      )}

      {context.orderNumber && (
        <div className="border-b border-[var(--line)] bg-[var(--background)] px-4 py-2">
          <Badge tone="accent"><Icon name="package" size={12} /> {context.orderNumber}</Badge>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-relevant="additions">
        {messages.map((message) => {
          const isBuyer = message.role === "buyer";
          return (
            <div key={message.id} className={`flex ${isBuyer ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[84%] rounded-2xl border px-4 py-2.5 text-sm leading-6 ${
                isBuyer
                  ? "rounded-br-sm border-transparent bg-[var(--accent)] text-[var(--accent-ink)]"
                  : "rounded-bl-sm border-[var(--line)] bg-[var(--surface-soft)] text-[var(--foreground)]"
              }`}>
                <p>{message.text}</p>
                {message.at && (
                  <p className={`mt-1 text-[10px] ${isBuyer ? "text-black/50" : "text-[var(--muted)]"}`}>
                    {formatDateTime(message.at)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-[var(--line)] px-3 py-3">
        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto" role="region" aria-label="Balasan cepat penjual" tabIndex={0}>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => send(prompt)}
              className="shrink-0 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/5 px-3 py-1.5 text-[11px] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/10"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            id="seller-chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={`Tulis pesan ke ${context.sellerName}...`}
            aria-label={`Pesan untuk ${context.sellerName}`}
            className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] transition hover:brightness-110 disabled:opacity-40"
            aria-label="Kirim pesan ke penjual"
          >
            <Icon name="arrow-right" size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}
