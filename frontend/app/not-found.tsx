import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-lora font-bold mb-2">Página não encontrada</h2>
      <p className="text-zinc-500 mb-8 max-w-md mx-auto">
        O link que você seguiu pode estar quebrado ou a página foi removida.
      </p>
      <Link href="/">
        <Button className="rounded-full px-8 bg-charcoal">
          Voltar ao Catálogo
        </Button>
      </Link>
    </div>
  );
}
