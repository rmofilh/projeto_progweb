'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Heart, ChevronRight, ArchiveX } from "lucide-react";
import { cn } from "@/lib/utils";
import { MockPatternRepository } from "@/src/adapters/repositories/MockPatternRepository";
import { Pattern, getDifficultyLabel } from "@/src/domain/entities/Pattern";

export default function VaultPage() {
  const [favorites, setFavorites] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const repo = new MockPatternRepository();

  useEffect(() => {
    repo.getFavorites().then(data => {
      setFavorites(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-alabaster font-outfit text-charcoal">
      <Header />

      <main className="flex-1">
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-12">
              <h1 className="text-4xl font-lora font-bold mb-2">Meu Baú Pessoal</h1>
              <p className="text-lg text-zinc-500">Seus riscos favoritos salvos para bordar quando quiser.</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-[400px] bg-zinc-200 animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                  <ArchiveX className="w-10 h-10 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-lora font-bold mb-2">Seu baú está vazio</h2>
                <p className="text-zinc-500 mb-8">Favorite alguns riscos no catálogo para vê-los aqui.</p>
                <Link href="/" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-8 h-12 bg-charcoal")}>
                  Ir para o Catálogo
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favorites.map((pattern) => (
                  <Card key={pattern.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow bg-white rounded-3xl group">
                    <div className="relative aspect-square bg-zinc-100 flex items-center justify-center">
                      <Image 
                        src={pattern.thumbnailPath} 
                        alt={pattern.title} 
                        fill 
                        className="object-contain p-8 group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-4 right-4">
                        <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-red-500 hover:bg-white">
                          <Heart className="w-5 h-5 fill-current" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="px-6 pt-6 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {getDifficultyLabel(pattern.difficulty)}
                        </span>
                      </div>
                      <CardTitle className="text-2xl font-lora font-bold leading-none">{pattern.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 py-4">
                      <CardDescription className="text-base text-zinc-600 line-clamp-2">
                        Pronto para usar na mesa de luz. Escala física garantida em {pattern.scaleCmReference}cm.
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="px-6 pb-8 pt-0">
                      <Link 
                        href={`/light-table/${pattern.id}`}
                        className={cn(buttonVariants({ variant: "default" }), "w-full h-12 rounded-2xl text-base font-semibold bg-charcoal hover:bg-charcoal/90 gap-2")}
                      >
                        Abrir Mesa de Luz
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
