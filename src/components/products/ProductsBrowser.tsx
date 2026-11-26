"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, EmptyState } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { filterProducts } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { categories, cities, getCategoryName, sellers } from "@/lib/mock-data";
import { useStore } from "@/lib/store/StoreProvider";
import type { ProductFilters as ProductFilterValues, SortOption } from "@/lib/types";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";

const PAGE_SIZE = 12;

const sortValues: SortOption[] = ["relevan", "harga-terendah", "harga-tertinggi", "terbaru", "terlaris", "rating"];
const sortLabels: Record<SortOption, string> = {
  relevan: "Paling relevan",
  "harga-terendah": "Harga terendah",
  "harga-tertinggi": "Harga tertinggi",
  terbaru: "Produk terbaru",
  terlaris: "Paling laris",
  rating: "Rating tertinggi",
};

function numberParam(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseSort(value: string | null): SortOption | undefined {
  if (!value) return undefined;
  return sortValues.find((option) => option === value);
}

export default function ProductsBrowser() {
  const { allProducts, ready } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<ProductFilterValues>(() => ({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    seller: searchParams.get("seller") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    minPrice: numberParam(searchParams.get("minPrice")),
    maxPrice: numberParam(searchParams.get("maxPrice")),
    rating: numberParam(searchParams.get("rating")),
    sort: parseSort(searchParams.get("sort")),
  }), [searchParams]);

  const results = useMemo(() => filterProducts(allProducts, filters), [allProducts, filters]);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageOutOfRange = page > totalPages;
  const currentPage = Math.min(page, totalPages);
  const pageProducts = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const activeFilters = useMemo(() => {
    const items: { key: string; label: string }[] = [];
    if (filters.q) items.push({ key: "q", label: `Pencarian: ${filters.q}` });
    if (filters.category) items.push({ key: "category", label: getCategoryName(filters.category) });
    if (filters.seller) items.push({ key: "seller", label: `Toko: ${sellers.find((seller) => seller.id === filters.seller)?.name ?? filters.seller}` });
    if (filters.city) items.push({ key: "city", label: `Kota: ${filters.city}` });
    if (filters.minPrice !== undefined) items.push({ key: "minPrice", label: `Mulai ${formatRupiah(filters.minPrice)}` });
    if (filters.maxPrice !== undefined) items.push({ key: "maxPrice", label: `Sampai ${formatRupiah(filters.maxPrice)}` });
    if (filters.rating !== undefined) items.push({ key: "rating", label: `Rating ${filters.rating}+` });
    if (filters.sort) items.push({ key: "sort", label: sortLabels[filters.sort] });
    return items;
  }, [filters]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="surface-card rounded-3xl p-5">
          <ProductFilters
            key={`${filters.q ?? ""}|${filters.minPrice ?? ""}|${filters.maxPrice ?? ""}`}
            categories={categories}
            cities={cities}
            resultCount={results.length}
            sellers={sellers}
          />
        </div>
      </aside>

      <section>
        {!ready && <p className="mb-4 text-xs text-[var(--muted)]">Menyiapkan produk dari toko lokal...</p>}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]" aria-live="polite">
            Menampilkan <span className="font-semibold text-[var(--foreground)]">{pageProducts.length}</span> dari {results.length} produk
          </p>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--muted)]">Filter aktif:</span>
              {activeFilters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => removeFilter(item.key)}
                  aria-label={`Hapus filter ${item.label}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
                >
                  {item.label}
                  <Icon name="close" size={12} />
                </button>
              ))}
              <button
                type="button"
                onClick={() => router.replace(pathname, { scroll: false })}
                className="text-xs font-medium text-[var(--accent)] transition hover:underline"
              >
                Hapus semua
              </button>
            </div>
          )}
        </div>
        {pageOutOfRange ? (
          <EmptyState
            icon="search"
            title="Halaman tidak ditemukan"
            description={`Katalog hanya memiliki ${totalPages} halaman.`}
            action={<Button variant="outline" onClick={() => goToPage(1)}>Kembali ke halaman 1</Button>}
          />
        ) : (
          <ProductGrid products={pageProducts} query={filters.q} />
        )}
        {results.length > PAGE_SIZE && !pageOutOfRange && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination produk">
            <Button size="sm" variant="outline" icon="arrow-left" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
              Sebelumnya
            </Button>
            <span className="px-3 text-xs text-[var(--muted)]">
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button size="sm" variant="outline" icon="arrow-right" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
              Berikutnya
            </Button>
          </nav>
        )}
      </section>
    </div>
  );
}
