import { describe, expect, it } from "vitest";
import { sellerChatGreeting, sellerChatKey, sellerChatReply } from "../src/lib/seller-chat";
import type { SellerChatContext } from "../src/lib/types";

const context: SellerChatContext = {
  sellerId: "s4",
  sellerSlug: "home-gym-corner",
  sellerName: "Home Gym Corner",
  product: { id: "p1", slug: "dumbbell-adjustable-20kg", name: "Dumbbell Adjustable 20kg", price: 899000, image: "/images/products/dumbbell-adjustable-20kg.jpg" },
};

describe("seller chat", () => {
  it("membuat kunci percakapan per penjual dan produk", () => {
    expect(sellerChatKey(context)).toBe("s4:p1:");
  });

  it("menyapa pembeli dengan konteks produk", () => {
    expect(sellerChatGreeting(context)).toContain("Dumbbell Adjustable 20kg");
  });

  it("membalas pertanyaan stok dengan nama produk", () => {
    expect(sellerChatReply(context, "Stok ready?")).toContain("Dumbbell Adjustable 20kg");
  });

  it("membalas pertanyaan harga dengan format rupiah", () => {
    expect(sellerChatReply(context, "Ada diskon?")).toContain("899.000");
  });

  it("membalas pertanyaan pengiriman pesanan", () => {
    const orderContext: SellerChatContext = { ...context, orderNumber: "CGI-20261120-4821" };
    expect(sellerChatReply(orderContext, "Kapan sampai?")).toContain("CGI-20261120-4821");
  });
});
