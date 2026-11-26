import ProductCard from "@/components/products/ProductCard";
import { Button, SectionHeading } from "@/components/ui";
import type { Product } from "@/lib/types";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section id="produk" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Katalog pilihan"
          title="Peralatan yang paling diminati"
          description="Produk terlaris dengan rating baik dari berbagai penjual."
        />
        <Button href="/products" variant="outline" icon="arrow-right">
          Lihat semua produk
        </Button>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
