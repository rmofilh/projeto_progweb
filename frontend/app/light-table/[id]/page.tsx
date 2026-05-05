import { MockPatternRepository } from "@/src/adapters/repositories/MockPatternRepository";
import { LightTableEngine } from "@/components/light-table/engine";
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function LightTablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = new MockPatternRepository();
  const pattern = await repo.findById(id);

  if (!pattern) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-alabaster p-6 text-center">
        <AlertCircle className="w-16 h-16 text-zinc-400 mb-4" />
        <h1 className="text-2xl font-lora font-bold mb-2">Risco não encontrado</h1>
        <Link href="/">
          <Button variant="link">Voltar ao catálogo</Button>
        </Link>
      </div>
    );
  }

  return <LightTableEngine pattern={pattern} />;
}
