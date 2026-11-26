import { Suspense } from "react";
import AuthForm from "@/components/account/AuthForm";
import { Breadcrumbs } from "@/components/ui";

async function LoginContent({ searchParams }: PageProps<"/login">) {
  const query = await searchParams;
  const next = typeof query.next === "string" ? query.next : "";

  return (
    <div className="mt-10">
      <AuthForm mode="login" next={next} />
    </div>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Masuk" }]} />
      <Suspense fallback={<div className="surface-card mt-10 rounded-3xl p-10 text-sm text-zinc-400">Memuat formulir masuk...</div>}>
        <LoginContent {...props} />
      </Suspense>
    </main>
  );
}
