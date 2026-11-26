"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { SafeImage } from "@/components/ui";
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

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Halo. Ceritakan kebutuhan olahragamu, saya bantu cari perlengkapan yang pas.",
  },
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
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "end" });
  }, [messages, pending, open]);

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
    const openChat = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail;
      setOpen(true);
      if (detail?.prompt) setInput(detail.prompt);
    };
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
      const cards = Array.isArray(payload.cards) ? payload.cards.filter(isChatCard) : [];
      setMessages((prev) => [
        ...prev,
        { id: createId("msg"), role: "assistant", text: payload.reply as string, cards },
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

  const showPrompts = !messages.some((message) => message.role === "user");

  return (
    <>
      {open && (
        <section
          id="chat-panel"
          className="fixed bottom-32 right-5 z-[90] flex max-h-[min(560px,calc(100vh-11rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-[var(--accent)]/30 bg-[var(--surface)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
          aria-label="Konsultan CGI Sports"
        >
          <div className="flex items-center gap-3 border-b border-[var(--accent)]/20 bg-[var(--accent)]/10 px-4 py-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--accent)]/40 bg-[var(--background)] p-1">
              <SafeImage src="/logo.webp" alt="CGI Sports" fill className="object-contain p-1" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-[var(--accent)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">Konsultan CGI Sports</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                Online · siap membantu
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMessages(initialMessages)}
              disabled={pending}
              className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--accent)] disabled:opacity-40"
              aria-label="Mulai percakapan baru"
            >
              <Icon name="refresh" size={16} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
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
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div key={message.id} className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-0.5">
                      <SafeImage src="/logo.webp" alt="" fill className="object-contain p-0.5" />
                    </span>
                  )}
                  <div
                    className={`max-w-[82%] border px-4 py-2.5 text-sm leading-6 ${
                      isUser
                        ? "rounded-2xl rounded-br-sm border-transparent bg-[var(--accent)] text-[var(--accent-ink)]"
                        : message.error
                          ? "rounded-2xl rounded-bl-sm border-rose-400/30 bg-rose-500/10 text-rose-200"
                          : "rounded-2xl rounded-bl-sm border-[var(--line)] bg-[var(--surface-soft)] text-[var(--foreground)]"
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
                            <Icon name="chevron-right" size={14} className="ml-auto shrink-0 text-[var(--muted)]" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {pending && (
              <div className="flex items-end gap-2" role="status" aria-label="Konsultan sedang mengetik">
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-0.5">
                  <SafeImage src="/logo.webp" alt="" fill className="object-contain p-0.5" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]"
                      style={{ animationDelay: `${dot * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[var(--line)] px-3 py-3">
            {showPrompts && (
              <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto" role="region" aria-label="Balasan cepat" tabIndex={0}>
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={pending}
                    onClick={() => void sendMessage(prompt)}
                    className="shrink-0 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/5 px-3 py-1.5 text-[11px] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 disabled:opacity-40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                id="chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={pending}
                placeholder="Tulis pertanyaanmu..."
                aria-label="Pertanyaan untuk Konsultan CGI Sports"
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
        className="fixed bottom-20 right-5 z-[95] flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--accent)] shadow-[0_10px_30px_rgba(198,242,74,0.2)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-label={open ? "Tutup Konsultan CGI Sports" : "Buka Konsultan CGI Sports"}
        aria-expanded={open}
        aria-controls="chat-panel"
      >
        <Icon name={open ? "close" : "chat"} size={20} />
        <span className="hidden sm:inline">{open ? "Tutup" : "Tanya CGI"}</span>
      </button>
    </>
  );
}
