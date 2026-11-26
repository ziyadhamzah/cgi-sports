import { describe, expect, it } from "vitest";
import { discountPercent, formatDiscountLabel, formatRupiah, makeOrderNumber, slugify } from "../src/lib/format";
import { isValidPhone, isValidPostalCode, normalizePhone } from "../src/lib/validation";

describe("format", () => {
  it("menghitung persentase diskon", () => {
    expect(discountPercent(80, 100)).toBe(20);
    expect(discountPercent(100, 100)).toBe(0);
    expect(discountPercent(80, 60)).toBe(0);
  });

  it("membuat label diskon", () => {
    expect(formatDiscountLabel(80, 100)).toBe("Hemat 20%");
    expect(formatDiscountLabel(80)).toBe("");
  });

  it("memformat rupiah Indonesia", () => {
    expect(formatRupiah(150000)).toContain("150.000");
  });

  it("membuat slug dan nomor pesanan", () => {
    expect(slugify("Matras Yoga Anti Slip!")).toBe("matras-yoga-anti-slip");
    expect(makeOrderNumber()).toMatch(/^CGI-\d{8}-\d{4}$/);
  });
});

describe("validation", () => {
  it("menerima nomor telepon Indonesia", () => {
    expect(normalizePhone("+62 812-3456-7890")).toBe("6281234567890");
    expect(isValidPhone("+62 812-3456-7890")).toBe(true);
    expect(isValidPhone("12345")).toBe(false);
  });

  it("memvalidasi kode pos", () => {
    expect(isValidPostalCode("40111")).toBe(true);
    expect(isValidPostalCode("4011")).toBe(false);
  });
});
