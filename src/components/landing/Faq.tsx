"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";

type FaqItem = { q: string; a: string };

export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-y border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <SectionHeading
          eyebrow="Pertanyaan umum"
          title="Yang sering ditanyakan"
          description="Jawaban singkat supaya kamu bisa langsung mulai berlatih."
        />
        <div className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--background)]">
          {items.map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.q}>
                <button
                  id={`faq-q-${index}`}
                  type="button"
                  onClick={() => setOpen(expanded ? null : index)}
                  aria-expanded={expanded}
                  aria-controls={`faq-answer-${index}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-[var(--foreground)] transition hover:text-[var(--accent)]"
                >
                  {item.q}
                  <Icon
                    name="chevron-down"
                    size={16}
                    className={`shrink-0 text-[var(--muted)] transition ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                {expanded && (
                  <p
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-q-${index}`}
                    className="px-5 pb-5 text-sm leading-7 text-[var(--muted)]"
                  >
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
