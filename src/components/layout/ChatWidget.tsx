"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Badge, SafeImage } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { createId } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";

type ChatCardType = "product" | "seller" | "service";
type ChatCard = {
  type: ChatCardType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image?: string;
};
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: ChatCard[];
  error?: boolean;
};

const quickPrompts = [
  "Rekomendasi sepatu lari",
  "Alat home gym untuk pemula",
  "Raket badminton di bawah 600 ribu",
  "Cara lacak pesanan",
];

const cardIcons: Record<ChatCardType, IconName> = {
  product: "box",
  seller: "store",
  service: "sparkles",
};

function isChatCard(value: unknown): value is ChatCard {
  if (typeof value !== "object" || value === null) return false;
  const card = value as Record<string, unknown>;
  const validType = card.type === "product" || card.type === "seller" || card.type === "service";
  const validImage = card.image === undefined || typeof card.image === "string";
  return (
    validType &&
    validImage &&
    typeof card.id === "string" &&
    typeof card.title === "string" &&
    typeof card.subtitle === "string" &&
    typeof card.href === "string"
  );
}

export default function ChatWidget() {
  const { orders } = useStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Halo. Ceritakan kebutuhan olahragamu, saya bantu cari perlengkapan yang pas.",
    },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "end" });
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
      wasOpen.current = true;
      return () => window.clearTimeout(timer);
    }
    if (wasOpen.current) fabRef.current?.focus();
    wasOpen.current = false;
  }, [open]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("cgi:open-chat", openChat);
    return () => window.removeEventListener("cgi:open-chat", openChat);
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    setMessages((prev) => [...prev, { id: createId("msg"), role: "user", text: trimmed }]);
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          orders: orders.slice(0, 10).map((order) => ({
            id: order.id,
            number: order.number,
            status: order.status,
            total: order.total,
            resi: order.resi,
            items: order.items.map((item) => item.name),
          })),
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: unknown = await response.json();
      const payload = data as { reply?: unknown; cards?: unknown };
      if (typeof payload.reply !== "string" || !payload.reply.trim()) {
        throw new Error("Balasan tidak tersedia");
      }
      const reply = payload.reply;
      const cards = Array.isArray(payload.cards) ? payload.cards.filter(isChatCard) : [];
      setMessages((prev) => [
        ...prev,
        { id: createId("msg"), role: "assistant", text: reply, cards },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createId("msg"),
          role: "assistant",
          text: "Maaf, layanan konsultasi sedang tidak tersedia. Silakan coba lagi nanti.",
          error: true,
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    void sendMessage(text);
  }

  return (
    <>
      {open && (
        <section
          id="chat-panel"
          className="fixed bottom-36 right-5 z-[90] flex max-h-[min(520px,calc(100vh-12rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl"
          aria-label="Konsultan Produk"
        >
          <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
              <Icon name="sparkles" size={17} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[var(--foreground)]">Konsultan Produk</p>
                <Badge tone="warning">Demo</Badge>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Jawaban berbasis kata kunci dari katalog bawaan</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto text-[var(--muted)] transition hover:text-[var(--foreground)]"
              aria-label="Tutup percakapan"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <div
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                      : message.error
                        ? "border border-rose-400/30 bg-rose-500/10 text-rose-200"
                        : "bg-[var(--background)] text-[var(--foreground)]"
                  }`}
                >
                  <p>{message.text}</p>
                  {message.cards && message.cards.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.cards.map((card) => (
                        <Link
                          key={`${card.type}-${card.id}`}
                          href={card.href}
                          className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 transition hover:border-[var(--accent)]/40"
                        >
                          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white/5 text-[var(--muted)]">
                            {card.image ? (
                              <SafeImage src={card.image} alt="" fill className="object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center">
                                <Icon name={cardIcons[card.type]} size={16} />
                              </span>
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-[var(--foreground)]">
                              {card.title}
                            </span>
                            <span className="block truncate text-[11px] text-[var(--muted)]">
                              {card.subtitle}
                            </span>
                          </span>
                          <Icon
                            name="chevron-right"
                            size={14}
                            className="ml-auto shrink-0 text-[var(--muted)]"
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {pending && (
              <p role="status" className="text-xs text-[var(--muted)]">Konsultan Produk sedang mengetik...</p>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[var(--line)] px-3 py-3">
            <div
              className="no-scrollbar mb-2 flex gap-2 overflow-x-auto"
              role="region"
              aria-label="Balasan cepat"
              tabIndex={0}
            >
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={pending}
                  onClick={() => void sendMessage(prompt)}
                  className="shrink-0 rounded-full border border-[var(--line)] px-3 py-1.5 text-[11px] text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)] disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                id="chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={pending}
                placeholder="Tulis pertanyaanmu..."
                aria-label="Pertanyaan untuk Konsultan Produk"
                className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] transition hover:brightness-110 disabled:opacity-40"
                aria-label="Kirim pesan"
              >
                <Icon name="arrow-right" size={16} />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        ref={fabRef}
        id="chat-fab"
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-20 right-5 z-[95] flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-ink)] shadow-xl transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label={open ? "Tutup Konsultan Produk" : "Buka Konsultan Produk"}
        aria-expanded={open}
        aria-controls="chat-panel"
      >
        <Icon name={open ? "close" : "chat"} size={20} />
        <span className="hidden sm:inline">{open ? "Tutup" : "Tanya Konsultan"}</span>
      </button>
    </>
  );
}
