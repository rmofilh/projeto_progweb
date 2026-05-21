'use client';

import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { authCubit } from "@/src/application/auth/AuthCubit";

export function Header() {
  const pathname = usePathname();
  const [authState, setAuthState] = useState(authCubit.getState());

  useEffect(() => {
    const unsubscribe = authCubit.subscribe(setAuthState);
    return () => { unsubscribe(); };
  }, []);

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
          
          {authState.status === "authenticated" ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">{authState.session?.user?.email || "mock@fioeluz.com"}</span>
              <button 
                onClick={() => authCubit.logout()} 
                className="text-lg font-medium text-charcoal hover:text-charcoal/70 transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => authCubit.loginMock("mock-token")}
              className="text-lg font-medium text-charcoal hover:text-charcoal/70 transition-colors"
            >
              Entrar (Mock)
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
