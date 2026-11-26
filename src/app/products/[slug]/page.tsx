import type { Metadata } from "next";
import { Badge, Breadcrumbs, Rating, SafeImage, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import LocalProductDetail from "@/components/products/LocalProductDetail";
import ProductActions from "@/components/products/ProductActions";
import ProductGrid from "@/components/products/ProductGrid";
import ProductReviews from "@/components/products/ProductReviews";
import ProductViewTracker from "@/components/products/ProductViewTracker";
import RecentlyViewed from "@/components/products/RecentlyViewed";
import SellerCard from "@/components/products/SellerCard";
import { getRelatedProducts } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { getCategoryName, getProductBySlug, getSellerBySlug, products } from "@/lib/mock-data";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Detail Produk | CGI Sports" };
  return { title: `${product.name} | CGI Sports`, description: product.description };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <LocalProductDetail slug={slug} />
      </main>
    );
  }

  const seller = getSellerBySlug(product.sellerSlug);
  const related = getRelatedProducts(product, products, 4);
  const gallery = Array.from(new Set(product.gallery));

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <ProductViewTracker product={product} />
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: "Produk", href: "/products" },
          { label: getCategoryName(product.categorySlug), href: `/products?category=${product.categorySlug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)]">
            <SafeImage
              src={product.image}
              alt={product.name}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
                  <SafeImage src={image} alt={`${product.name} tampilan ${index + 1}`} sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">{getCategoryName(product.categorySlug)}</Badge>
            {product.isPromo && <Badge tone="accent">{product.promoLabel ?? "Promo"}</Badge>}
            {product.isNew && <Badge tone="success">Produk baru</Badge>}
            {product.isBestseller && <Badge tone="warning">Terlaris</Badge>}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Rating value={product.rating} count={product.reviewCount} size={16} />
            <span className="text-xs text-zinc-500">{product.sold} unit terjual</span>
          </div>
          <p className="mt-5 text-sm leading-7 text-zinc-400">{product.description}</p>
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-semibold text-[var(--accent)]">{formatRupiah(product.price)}</span>
            {product.originalPrice && (
              <span className="pb-1 text-sm text-zinc-500 line-through">{formatRupiah(product.originalPrice)}</span>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-2"><Icon name="box" size={15} /> Stok {product.stock} unit</span>
            <span className="inline-flex items-center gap-2"><Icon name="location" size={15} /> Dikirim dari {product.city}</span>
            <span className="inline-flex items-center gap-2"><Icon name="package" size={15} /> {product.weight ? `${product.weight} gram` : "Berat tidak tersedia"}</span>
          </div>
          <div className="mt-7">
            <ProductActions product={product} />
          </div>
        </section>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="text-2xl font-semibold text-white">Detail produk</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{product.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {product.tags.map((tag) => <Badge key={tag} tone="neutral">{tag}</Badge>)}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="surface-soft rounded-2xl p-4">
              <Icon name="truck" size={20} className="text-[var(--accent)]" />
              <p className="mt-3 text-sm font-medium text-white">Pengiriman cepat</p>
              <p className="mt-1 text-xs text-zinc-500">Dikirim dari {product.city}</p>
            </div>
            <div className="surface-soft rounded-2xl p-4">
              <Icon name="shield" size={20} className="text-[var(--accent)]" />
              <p className="mt-3 text-sm font-medium text-white">Transaksi aman</p>
              <p className="mt-1 text-xs text-zinc-500">Pembayaran disimulasikan dalam mode demo</p>
            </div>
            <div className="surface-soft rounded-2xl p-4">
              <Icon name="refresh" size={20} className="text-[var(--accent)]" />
              <p className="mt-3 text-sm font-medium text-white">Pantau harga</p>
              <p className="mt-1 text-xs text-zinc-500">Simpan produk untuk memantau perubahan harga</p>
            </div>
          </div>
        </section>
        <aside>
          <h2 className="mb-4 text-lg font-semibold text-white">Informasi penjual</h2>
          {seller ? <SellerCard seller={seller} /> : (
            <div className="surface-card rounded-3xl p-5">
              <p className="text-sm font-semibold text-white">{product.sellerName}</p>
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-400">
                <Icon name="location" size={14} /> {product.city}
              </p>
            </div>
          )}
        </aside>
      </div>

      <ProductReviews product={product} />

      <section className="mt-16">
        <SectionHeading eyebrow="Rekomendasi" title="Produk serupa" description="Pilihan lain dari kategori yang sama." />
        <div className="mt-8">
          <ProductGrid products={related} />
        </div>
      </section>

      <RecentlyViewed />
    </main>
  );
}
