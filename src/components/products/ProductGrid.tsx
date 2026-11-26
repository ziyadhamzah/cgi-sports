import { Button, EmptyState } from "@/components/ui";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

export default function ProductGrid({ products, className = "", query }: { products: Product[]; className?: string; query?: string }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon="search"
        title={query ? `Tidak ada produk untuk “${query}”` : "Produk tidak ditemukan"}
        description="Coba ubah kata kunci atau filter agar produk lain muncul."
        action={<Button href="/products" variant="outline">Lihat semua produk</Button>}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}
