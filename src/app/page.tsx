import CtaSection from "@/components/landing/CtaSection";
import Faq from "@/components/landing/Faq";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import FeaturedSellers from "@/components/landing/FeaturedSellers";
import FlashSale from "@/components/landing/FlashSale";
import Hero from "@/components/landing/Hero";
import PromoMarquee from "@/components/landing/PromoMarquee";
import QuickCategories from "@/components/landing/QuickCategories";
import ServicesTeaser from "@/components/landing/ServicesTeaser";
import Testimonials from "@/components/landing/Testimonials";
import WhySports from "@/components/landing/WhySports";
import { categories, faqs, products, sellers, services } from "@/lib/mock-data";

const promoProducts = products.filter((product) => product.isPromo).slice(0, 4);
const promoIds = new Set(promoProducts.map((product) => product.id));
const featuredProducts = products
  .filter((product) => !promoIds.has(product.id))
  .sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || b.sold - a.sold)
  .slice(0, 8);
const featuredSellers = sellers.slice(0, 3);

export default function Home() {
  return (
    <>
      <Hero />
      <PromoMarquee />
      <QuickCategories categories={categories} />
      <FlashSale products={promoProducts} />
      <FeaturedProducts products={featuredProducts} />
      <WhySports />
      <FeaturedSellers sellers={featuredSellers} />
      <ServicesTeaser services={services} />
      <Testimonials />
      <Faq items={faqs} />
      <CtaSection />
    </>
  );
}
