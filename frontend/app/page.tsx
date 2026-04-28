import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Heart, Lightbulb, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_PATTERNS = [
  {
    id: "1",
    title: "Buquê de Primavera",
    description: "Um arranjo floral clássico e delicado.",
    image: "/pattern-floral.png",
    difficulty: "Fácil",
  },
  {
    id: "2",
    title: "Gato na Lua",
    description: "Desenho lúdico ideal para quartos infantis.",
    image: "/pattern-animal.png",
    difficulty: "Médio",
  },
  {
    id: "3",
    title: "Mandala Geométrica",
    description: "Padrões modernos para decoração contemporânea.",
    image: "/pattern-geometric.png",
    difficulty: "Avançado",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-alabaster font-outfit text-charcoal">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-20 items-center justify-between px-6 mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-charcoal rounded-full flex items-center justify-center">
              <Lightbulb className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-lora font-bold tracking-tight">Fio & Luz</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-lg font-medium">
            <Link href="/" className="hover:text-charcoal/70 transition-colors">Catálogo</Link>
            <Link href="#" className="hover:text-charcoal/70 transition-colors text-zinc-400 cursor-not-allowed">Meu Baú</Link>
            <Link href="#" className="hover:text-charcoal/70 transition-colors text-zinc-400 cursor-not-allowed">Sobre</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

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

        {/* Catalog Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-lora font-bold mb-2">Riscos em Destaque</h2>
                <p className="text-lg text-zinc-500">Comece seu próximo projeto hoje mesmo.</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <Input placeholder="Buscar por tema..." className="pl-10 h-12 rounded-xl bg-white border-zinc-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SAMPLE_PATTERNS.map((pattern) => (
                <Card key={pattern.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow bg-white rounded-3xl group">
                  <div className="relative aspect-square bg-zinc-100 flex items-center justify-center">
                    <Image 
                      src={pattern.image} 
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
                        {pattern.difficulty}
                      </span>
                    </div>
                    <CardTitle className="text-2xl font-lora font-bold leading-none">{pattern.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-4">
                    <CardDescription className="text-base text-zinc-600 line-clamp-2">
                      {pattern.description}
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

      <footer className="py-12 px-6 bg-charcoal border-t border-white/10 text-zinc-400 text-center">
        <div className="container mx-auto text-sm">
          <p>© 2026 Fio & Luz - Criado com carinho para quem ama bordar.</p>
        </div>
      </footer>
    </div>
  );
}
