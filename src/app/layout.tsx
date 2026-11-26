import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import AnalyticsTracker from "@/components/layout/AnalyticsTracker";
import ChatWidget from "@/components/layout/ChatWidget";
import SellerChatPanel from "@/components/chat/SellerChatPanel";
import CompareBar from "@/components/layout/CompareBar";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { ToastHost } from "@/components/ui";
import { StoreProvider } from "@/lib/store/StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://cgi-sports.example.com"),
  title: "CGI Sports | Marketplace Alat Olahraga",
  description:
    "Temukan, bandingkan, dan pilih alat olahraga favoritmu. Coba Konsultan Produk di CGI Sports untuk rekomendasi yang sesuai.",
  openGraph: {
    title: "CGI Sports | Marketplace Alat Olahraga",
    description: "Katalog alat olahraga, perbandingan produk, dan Konsultan Produk untuk menemukan perlengkapan yang tepat.",
    images: ["/logo.webp"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--accent-ink)]"
        >
          Lewati ke konten
        </a>
        <Script id="cgi-theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem("cgi_sports_theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`}
        </Script>
        <StoreProvider>
          <Suspense
            fallback={
              <div className="sticky top-0 z-50 h-16 border-b border-[var(--line)] bg-[var(--background)]" />
            }
          >
            <Navbar />
          </Suspense>
          <main id="main" className="mx-auto min-h-[60vh] w-full">{children}</main>
          <Footer />
          <ChatWidget />
          <SellerChatPanel />
          <Suspense fallback={null}>
            <CompareBar />
          </Suspense>
          <ToastHost />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}
