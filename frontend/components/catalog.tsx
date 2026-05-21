'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pattern, getDifficultyLabel } from "@/src/domain/entities/Pattern";
import { useFavorites } from "@/src/presentation/hooks/useFavorites";
import { useToggleFavorite } from "@/src/presentation/hooks/useToggleFavorite";

import { Collection } from "@/src/domain/entities/Collection";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CatalogProps {
  initialPatterns: Pattern[];
  collections?: Collection[];
}

export function Catalog({ initialPatterns, collections = [] }: CatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [hideFavorites, setHideFavorites] = useState(false);

  const { data: favorites = [] } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const isFavorite = (id: string) => favorites.some(f => f.id === id);

  const filteredPatterns = initialPatterns.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCollection = activeCollectionId ? p.collectionId === activeCollectionId : true;
    const matchDifficulty = difficultyFilter ? p.difficulty === difficultyFilter : true;
    const matchFavorites = hideFavorites ? !isFavorite(p.id) : true;
    return matchSearch && matchCollection && matchDifficulty && matchFavorites;
  });

  return (
    <section id="catalog-section" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-lora font-bold mb-2">Riscos em Destaque</h2>
            <p className="text-lg text-zinc-500">Comece seu próximo projeto hoje mesmo.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <Input 
              placeholder="Buscar por tema..." 
              className="pl-10 h-12 rounded-xl bg-white border-zinc-200" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Toolbar */}
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
            <div className="flex items-center space-x-2">
              <Switch id="hide-favorites" checked={hideFavorites} onCheckedChange={setHideFavorites} />
              <Label htmlFor="hide-favorites">Ocultar favoritados</Label>
            </div>
            <div className="h-6 w-px bg-zinc-200 hidden md:block"></div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPatterns.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-500">
              Nenhum risco encontrado com os filtros selecionados.
            </div>
          ) : (
            filteredPatterns.map((pattern) => (
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
                      <Heart className={cn("w-5 h-5", isFavorite(pattern.id) ? "fill-red-500 text-red-500" : "")} />
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
                    Escala: {pattern.scaleCmReference}cm de largura. Perfeito para decalque em bastidor.
                  </CardDescription>
                </CardContent>
                <CardFooter className="px-6 pb-8 pt-0">
                  <Link 
                    href={`/light-table/${pattern.id}`}
                    className={cn(buttonVariants({ variant: "default" }), "w-full h-12 rounded-2xl text-base font-semibold bg-charcoal hover:bg-charcoal/90 gap-2")}
                  >
                    Usar Mesa de Luz
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
