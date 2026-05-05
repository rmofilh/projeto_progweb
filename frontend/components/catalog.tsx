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

interface CatalogProps {
  initialPatterns: Pattern[];
}

export function Catalog({ initialPatterns }: CatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatterns = initialPatterns.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPatterns.map((pattern) => (
            <Card key={pattern.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow bg-white rounded-3xl group">
              <div className="relative aspect-square bg-zinc-100 flex items-center justify-center">
                <Image 
                  src={pattern.thumbnailPath} 
                  alt={pattern.title} 
                  fill 
                  className="object-contain p-8 group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 right-4">
                  <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white">
                    <Heart className="w-5 h-5" />
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
          ))}
        </div>
      </div>
    </section>
  );
}
