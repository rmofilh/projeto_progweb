import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Catalog } from "@/components/catalog";
import { Button } from "@/components/ui/button";
import { MockPatternRepository } from "@/src/infrastructure/repositories/MockPatternRepository";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroClient } from "@/components/hero-client";

function CatalogSkeleton() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-12 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-[400px] w-full rounded-3xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const repo = new MockPatternRepository();
  const patterns = await repo.listAll();
  const collections = await repo.listCollections();

  return (
    <div className="flex flex-col min-h-screen bg-alabaster font-outfit text-charcoal">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-white border-b">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl md:text-6xl font-lora font-bold mb-6 leading-tight">
              Descubra o prazer de bordar com facilidade.
            </h1>
            <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Encontre riscos exclusivos e use nossa <span className="font-semibold text-charcoal">Mesa de Luz Digital</span> para transferir seus desenhos diretamente para o tecido.
            </p>
            <HeroClient />
          </div>
        </section>

        {/* Catalog Section with Suspense & RSC Data Fetching */}
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog initialPatterns={patterns} collections={collections} />
        </Suspense>

      </main>

      <Footer />
    </div>
  );
}
