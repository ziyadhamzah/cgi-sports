import { SectionHeading } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";

const items: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "sparkles",
    title: "Saringan kata kunci",
    text: "Konsultan Produk menyaring katalog berdasarkan kata kunci yang kamu berikan."
  },
  {
    icon: "scale",
    title: "Bandingkan mudah",
    text: "Lihat selisih harga, rating, stok, dan penjual dalam satu halaman perbandingan.",
  },
  {
    icon: "shield",
    title: "Profil penjual lengkap",
    text: "Informasi toko, rating, dan lokasi ditampilkan agar kamu lebih yakin memilih.",
  },
  {
    icon: "truck",
    title: "Lacak transparan",
    text: "Pantau status pesanan dari pembayaran sampai barang sampai di tujuan.",
  },
  {
    icon: "refresh",
    title: "Layanan lengkap",
    text: "Stringing raket, personal trainer, servis sepatu, hingga booking lapangan.",
  },
  {
    icon: "store",
    title: "Toko sendiri",
    text: "Buka dashboard penjual dan kelola produk langsung dari browser kamu.",
  },
];

export default function WhySports() {
  return (
    <section className="border-y border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Keunggulan"
          title="Belanja olahraga jadi lebih mantap"
          description="Fitur yang dirancang untuk mengurangi bingung dan mempercepat keputusan."
          center
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="surface-card rounded-3xl p-7 transition hover:-translate-y-1 hover:border-[var(--accent)]/30">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]">
                <Icon name={item.icon} size={20} />
              </span>
              <h3 className="mt-6 text-lg font-semibold text-[var(--foreground)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
