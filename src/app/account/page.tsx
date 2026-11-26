"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import AddressBook from "@/components/account/AddressBook";
import ImageUpload from "@/components/ui/ImageUpload";
import { Badge, Breadcrumbs, Button, EmptyState, SectionHeading } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/Icon";
import { formatDate, initials } from "@/lib/format";
import { useStore } from "@/lib/store/StoreProvider";
import type { ServiceRequestStatus } from "@/lib/types";

const quickLinks: { href: string; label: string; description: string; icon: IconName }[] = [
  { href: "/orders", label: "Pesanan", description: "Cek status dan riwayat pesanan", icon: "box" },
  { href: "/wishlist", label: "Wishlist", description: "Produk favorit yang kamu simpan", icon: "heart" },
  { href: "/account#alamat", label: "Alamat", description: "Kelola alamat pengiriman", icon: "location" },
  { href: "/admin/analytics", label: "Analitik (demo admin)", description: "Lihat statistik kunjungan toko", icon: "chart" },
  { href: "/seller/dashboard", label: "Buka Toko", description: "Kelola toko dan produk kamu", icon: "store" },
];

function requestTone(status: ServiceRequestStatus): "success" | "warning" | "neutral" | "danger" {
  if (status === "selesai") return "success";
  if (status === "menunggu") return "warning";
  if (status === "ditolak") return "danger";
  return "neutral";
}

export default function AccountPage() {
  const router = useRouter();
  const { ready, user, allOrders, serviceRequests, logout, updateUserPhoto } = useStore();

  if (!ready) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-zinc-400 md:px-8">Memuat akun...</div>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
        <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Akun" }]} />
        <div className="mt-12">
          <EmptyState
            icon="user"
            title="Masuk untuk melihat akun"
            description="Kelola alamat, wishlist, pesanan, dan pengajuan layanan kamu setelah masuk."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button href="/login?next=%2Faccount" icon="user">Masuk</Button>
                <Button href="/register?next=%2Faccount" variant="outline" icon="plus">Daftar</Button>
              </div>
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Akun" }]} />
      <div className="mt-8">
        <SectionHeading eyebrow="Halaman pribadi" title="Akun kamu" description="Kelola profil, alamat, dan aktivitas belanja kamu di satu tempat." />
      </div>

      <section className="surface-card mt-10 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {user.photo ? (
              <Image src={user.photo} alt={`Foto ${user.name}`} width={56} height={56} unoptimized className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-lg font-bold text-[var(--accent)]">
                {initials(user.name)}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{user.name}</h2>
                <Badge tone={user.role === "admin" ? "accent" : "neutral"}>{user.role === "admin" ? "Admin" : "Anggota"}</Badge>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            icon="logout"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            Keluar akun
          </Button>
        </div>
        <div className="mt-6 max-w-md border-t border-[var(--line)] pt-6">
          <ImageUpload
            label="Foto profil"
            value={user.photo ?? ""}
            onChange={updateUserPhoto}
            hint="Gambar disimpan di browser ini. Maksimal 2 MB."
            square
          />
        </div>
      </section>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {quickLinks.map((link) => (
          <Button key={link.href} href={link.href} variant="outline" className="h-full flex-col items-start gap-2 rounded-2xl px-5 py-6 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[var(--accent)]">
              <Icon name={link.icon} size={19} />
            </span>
            <span className="text-sm font-semibold text-white">{link.label}</span>
            <span className="text-xs font-normal text-zinc-500">{link.description}</span>
          </Button>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <AddressBook />

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Riwayat pengajuan layanan</h2>
              <p className="mt-1 text-xs text-zinc-500">{serviceRequests.length} pengajuan tercatat</p>
            </div>
            <Button size="sm" variant="outline" href="/services" icon="arrow-right">Layanan</Button>
          </div>

          {serviceRequests.length === 0 ? (
            <div className="surface-soft rounded-2xl px-6 py-10 text-center">
              <p className="text-sm text-zinc-400">Belum ada pengajuan layanan.</p>
              <Button size="sm" className="mt-4" href="/services">Lihat layanan</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {serviceRequests.map((request) => (
                <article key={request.id} className="surface-soft rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{request.serviceName}</h3>
                      <p className="mt-1 font-mono text-[11px] text-zinc-500">{request.number}</p>
                    </div>
                    <Badge tone={requestTone(request.status)}>{request.status}</Badge>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-zinc-400">{request.notes || "Tanpa catatan tambahan."}</p>
                  <p className="mt-3 text-[11px] text-zinc-500">Diajukan {formatDate(request.createdAt)}</p>
                </article>
              ))}
            </div>
          )}

          {allOrders.length > 0 && (
            <div className="surface-card mt-5 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">Pesanan terakhir</h3>
                  <p className="mt-1 text-xs text-zinc-500">{allOrders[0].number}</p>
                </div>
                <Button size="sm" variant="ghost" href="/orders" icon="arrow-right">Semua</Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
