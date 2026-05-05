'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Lightbulb, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between px-6 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-charcoal rounded-full flex items-center justify-center">
            <Lightbulb className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-lora font-bold tracking-tight">Fio & Luz</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-lg font-medium">
          <Link 
            href="/" 
            className={cn("hover:text-charcoal/70 transition-colors", pathname === "/" ? "text-charcoal" : "text-zinc-500")}
          >
            Catálogo
          </Link>
          <Link 
            href="/vault" 
            className={cn("hover:text-charcoal/70 transition-colors", pathname === "/vault" ? "text-charcoal" : "text-zinc-500")}
          >
            Meu Baú
          </Link>
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
  );
}
