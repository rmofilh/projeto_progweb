import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Catalog } from "@/components/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MockPatternRepository } from "@/src/adapters/repositories/MockPatternRepository";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-charcoal hover:bg-charcoal/90 transition-all">
                Ver Catálogo Completo
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-charcoal text-charcoal hover:bg-zinc-50">
                Como Funciona?
              </Button>
            </div>
          </div>
        </section>

        {/* Catalog Section with Suspense & RSC Data Fetching */}
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog initialPatterns={patterns} />
        </Suspense>

        {/* Community */}
        <section className="py-20 px-6 bg-charcoal text-white rounded-t-[4rem]">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-lora font-bold mb-6">Participe da nossa comunidade</h2>
            <p className="text-xl text-zinc-300 mb-10 max-w-xl mx-auto leading-relaxed">
              Receba novos riscos toda semana diretamente no seu e-mail e compartilhe suas criações.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input placeholder="Seu melhor e-mail" className="h-14 rounded-full bg-white/10 border-white/20 text-white placeholder:text-zinc-400" />
              <Button className="h-14 px-8 rounded-full bg-white text-charcoal hover:bg-zinc-100">
                Inscrever
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
