'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error(error);
    
    // Dispara Toast para feedback visual imediato
    toast.error("Erro de Conexão ou Sistema", {
      description: "Ocorreu uma falha ao carregar os dados. Verifique se o servidor está online."
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-lora font-bold mb-2">Ops! Algo deu errado.</h2>
      <p className="text-zinc-500 mb-8 max-w-md mx-auto">
        Não conseguimos carregar esta página. Isso pode ser uma falha temporária no banco de dados ou na sua conexão.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="rounded-full px-8 bg-charcoal">
          Tentar Novamente
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'} className="rounded-full px-8">
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}
