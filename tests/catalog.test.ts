import { describe, expect, it } from "vitest";
import { computeDiscount, filterProducts, validateVoucher } from "../src/lib/catalog";
import { products } from "../src/lib/mock-data";

const resolve = (id: string) => products.find((product) => product.id === id);

describe("catalog", () => {
  it("mengurutkan produk termurah", () => {
    const result = filterProducts(products, { sort: "harga-terendah" });
    expect(result[0].price).toBeLessThanOrEqual(result[1].price);
  });

  it("memfilter berdasarkan penjual", () => {
    const result = filterProducts(products, { seller: "s3" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => product.sellerId === "s3")).toBe(true);
  });

  it("voucher kategori memakai subtotal produk kategori saja", () => {
    const items = [{ productId: "p6", quantity: 1 }];
    const subtotal = items.reduce((sum, item) => sum + (resolve(item.productId)?.price ?? 0) * item.quantity, 0);
    const validation = validateVoucher("LARI15", subtotal, items, resolve);

    expect(validation.error).toBeUndefined();
    expect(computeDiscount(validation.voucher, subtotal, items, resolve)).toBe(Math.round(759000 * 0.15));
  });

  it("menolak voucher kategori bila subtotal kategori di bawah minimum", () => {
    const items = [
      { productId: "p1", quantity: 1 },
      { productId: "p9", quantity: 1 },
    ];
    const subtotal = 899000 + 99000;
    const validation = validateVoucher("LARI15", subtotal, items, resolve);

    expect(validation.voucher).toBeUndefined();
    expect(validation.error).toContain("Minimal belanja");
  });
});
