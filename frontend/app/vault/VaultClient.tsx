'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Heart, ChevronRight, ArchiveX, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/src/presentation/hooks/useFavorites";
import { useToggleFavorite } from "@/src/presentation/hooks/useToggleFavorite";
import { getDifficultyLabel, Pattern } from "@/src/domain/entities/Pattern";
import { Collection } from "@/src/domain/entities/Collection";
import { Input } from "@/components/ui/input";

export function VaultClient({ collections }: { collections: Collection[] }) {
  const { data: favorites = [], isLoading } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

  const filteredFavorites = favorites.filter((p: Pattern) => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCollection = activeCollectionId ? p.collectionId === activeCollectionId : true;
    const matchDifficulty = difficultyFilter ? p.difficulty === difficultyFilter : true;
    return matchSearch && matchCollection && matchDifficulty;
  });

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-lora font-bold mb-2">Meu Baú Pessoal</h1>
            <p className="text-lg text-zinc-500">Seus riscos favoritos salvos para bordar quando quiser.</p>
          </div>
          {favorites.length > 0 && (
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <Input 
                placeholder="Buscar nos favoritos..." 
                className="pl-10 h-12 rounded-xl bg-white border-zinc-200" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {favorites.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center mb-12 bg-white p-4 rounded-3xl shadow-sm border border-zinc-100">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCollectionId === null ? "default" : "secondary"}
                className={cn("rounded-full", activeCollectionId === null ? "bg-charcoal" : "")}
                onClick={() => setActiveCollectionId(null)}
              >
                Todos
              </Button>
              {collections.map(c => (
                <Button
                  key={c.id}
                  variant={activeCollectionId === c.id ? "default" : "secondary"}
                  className={cn("rounded-full", activeCollectionId === c.id ? "bg-charcoal text-white" : "")}
                  onClick={() => setActiveCollectionId(c.id)}
                >
                  {c.title}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      difficultyFilter === d ? "bg-charcoal text-white scale-110" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    )}
                    title={`Dificuldade ${d}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
        ) : filteredFavorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
            Nenhum favorito encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFavorites.map((pattern: Pattern) => (
              <Card key={pattern.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow bg-white rounded-3xl group">
                <div className="relative aspect-square bg-zinc-100 flex items-center justify-center">
                  <Image 
                    src={pattern.thumbnailPath} 
                    alt={pattern.title} 
                    fill 
                    className="object-contain p-8 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 right-4">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white"
                      onClick={() => toggleFavoriteMutation.mutate(pattern.id)}
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
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
  );
}
