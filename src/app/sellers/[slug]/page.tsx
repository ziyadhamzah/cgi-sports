import type { Metadata } from "next";
import SellerStorefront from "@/components/seller/SellerStorefront";
import { getSellerBySlug, sellers } from "@/lib/mock-data";

export const instant = false;

export function generateStaticParams() {
  return sellers.map((seller) => ({ slug: seller.slug }));
}

export const metadata: Metadata = {
  title: "Toko Penjual | CGI Sports",
  description: "Lihat profil penjual dan produk yang mereka tawarkan.",
};

export default async function SellerDetailPage({ params }: PageProps<"/sellers/[slug]">) {
  const { slug } = await params;
  return <SellerStorefront slug={slug} staticSeller={getSellerBySlug(slug) ?? null} />;
}
