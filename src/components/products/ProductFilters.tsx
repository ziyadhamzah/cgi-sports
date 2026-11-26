"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge, Button, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import type { Category } from "@/lib/types";

type ProductFiltersProps = {
  categories: Category[];
  cities: string[];
  resultCount: number;
  sellers: { id: string; name: string }[];
};

const sortOptions = [
  { value: "relevan", label: "Paling relevan" },
  { value: "harga-terendah", label: "Harga terendah" },
  { value: "harga-tertinggi", label: "Harga tertinggi" },
  { value: "terbaru", label: "Produk terbaru" },
  { value: "terlaris", label: "Paling laris" },
  { value: "rating", label: "Rating tertinggi" },
];

const ratingOptions = [
  { value: "", label: "Semua rating" },
  { value: "4.5", label: "4,5 ke atas" },
  { value: "4", label: "4 ke atas" },
  { value: "3", label: "3 ke atas" },
];

function normalizePrice(value: string) {
  if (!value.trim()) return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return "";
  return String(Math.round(parsed));
}

export default function ProductFilters({ categories, cities, resultCount, sellers }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") ?? "");
  const [priceError, setPriceError] = useState("");
  const activeCategory = searchParams.get("category") ?? "";
  const activeCity = searchParams.get("city") ?? "";
  const activeSeller = searchParams.get("seller") ?? "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const commitPrice = (key: "minPrice" | "maxPrice", value: string) => {
    const normalized = normalizePrice(value);
    const min = key === "minPrice" ? normalized : normalizePrice(minPrice);
    const max = key === "maxPrice" ? normalized : normalizePrice(maxPrice);
    if (min && max && Number(min) > Number(max)) {
      setPriceError("Harga minimum tidak boleh lebih besar dari harga maksimum.");
      return;
    }
    setPriceError("");
    updateParam(key, normalized);
  };

  const clearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setPriceError("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <Icon name="filter" size={16} className="text-[var(--accent)]" /> Filter Produk
        </h2>
        <span className="text-xs text-[var(--muted)]">{resultCount} produk</span>
      </div>

      <form
        className="mt-5 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          updateParam("q", search.trim());
        }}
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari produk atau kategori"
          aria-label="Cari produk"
          className={inputClass}
        />
        <Button type="submit" size="sm" icon="search">
          Cari
        </Button>
      </form>

      <div className="mt-6">
        <p className="mb-3 text-xs font-medium text-[var(--muted)]">Kategori</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParam("category", "")}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              activeCategory === "" ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
            }`}
          >
            Semua
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateParam("category", category.slug)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                activeCategory === category.slug ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Field label="Harga minimum">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            onBlur={() => commitPrice("minPrice", minPrice)}
            placeholder="0"
            className={inputClass}
          />
        </Field>
        <Field label="Harga maksimum">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            onBlur={() => commitPrice("maxPrice", maxPrice)}
            placeholder="Tanpa batas"
            className={inputClass}
          />
        </Field>
      </div>

      {priceError && <p role="alert" className="mt-2 text-xs text-rose-400">{priceError}</p>}

      <div className="mt-5 space-y-4">
        <Field label="Penjual">
          <select
            value={activeSeller}
            onChange={(event) => updateParam("seller", event.target.value)}
            className={inputClass}
          >
            <option value="">Semua penjual</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>{seller.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Kota penjual">
          <select
            value={activeCity}
            onChange={(event) => updateParam("city", event.target.value)}
            className={inputClass}
          >
            <option value="">Semua kota</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rating minimum">
          <select
            value={searchParams.get("rating") ?? ""}
            onChange={(event) => updateParam("rating", event.target.value)}
            className={inputClass}
          >
            {ratingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Urutkan">
          <select
            value={searchParams.get("sort") ?? ""}
            onChange={(event) => updateParam("sort", event.target.value)}
            className={inputClass}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-5">
        <Button variant="ghost" size="sm" icon="refresh" onClick={clearFilters}>
          Hapus filter
        </Button>
        <Badge tone="neutral">Katalog diperbarui otomatis</Badge>
      </div>
    </div>
  );
}
