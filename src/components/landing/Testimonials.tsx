import { Rating, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";

const testimonials = [
  {
    name: "Rani Pramesti",
    city: "Bandung",
    rating: 5,
    text: "Ceritakan kebutuhan ke Konsultan Produk, langsung dapat rekomendasi sepatu lari yang pas. Prosesnya cepat dan jelas.",
  },
  {
    name: "Dimas Setiawan",
    city: "Jakarta",
    rating: 5,
    text: "Fitur bandingkan sangat membantu. Harga, rating, dan stok beberapa dumbbell bisa dilihat berdampingan.",
  },
  {
    name: "Ayu Lestari",
    city: "Surabaya",
    rating: 4,
    text: "Pesanan mudah dilacak sampai tiba. Penjualnya responsif dan perlengkapan sesuai deskripsi.",
  },
];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Testimoni"
        title="Pengalaman belanja pelanggan"
        description="Cerita singkat dari pelanggan yang memakai CGI Sports untuk mencari perlengkapan latihan."
        center
      />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure key={testimonial.name} className="surface-card flex flex-col rounded-3xl p-6 transition hover:-translate-y-1 hover:border-[var(--accent)]/30 md:p-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Icon name="chat" size={18} />
            </span>
            <blockquote className="mt-4 text-sm leading-7 text-[var(--foreground)]">
              {testimonial.text}
            </blockquote>
            <figcaption className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line)] pt-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-sm font-semibold text-[var(--accent)]">
                  {testimonial.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{testimonial.name}</p>
                  <p className="text-xs text-[var(--muted)]">{testimonial.city}</p>
                </div>
              </div>
              <Rating value={testimonial.rating} />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
