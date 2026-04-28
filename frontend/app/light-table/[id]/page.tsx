'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Maximize2, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Mock data matching the catalog
const SAMPLE_PATTERNS = [
  { id: "1", title: "Buquê de Primavera", image: "/pattern-floral.png" },
  { id: "2", title: "Gato na Lua", image: "/pattern-animal.png" },
  { id: "3", title: "Mandala Geométrica", image: "/pattern-geometric.png" },
];

export default function LightTablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [showExitHint, setShowExitHint] = useState(true);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const pattern = SAMPLE_PATTERNS.find(p => p.id === id);

  // Wake Lock Logic
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
        console.log('Wake Lock active');
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock]);

  // Fullscreen Logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      requestWakeLock();
      setShowExitHint(false);
      toast.success("Mesa de Luz Ativada", {
        description: "Brilho máximo garantido. Toque longo para sair."
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Long Press Exit Logic
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
      router.push('/');
    }, 1500); // 1.5 seconds to exit
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  if (!pattern) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-alabaster p-6 text-center">
        <AlertCircle className="w-16 h-16 text-zinc-400 mb-4" />
        <h1 className="text-2xl font-lora font-bold mb-2">Risco não encontrado</h1>
        <Button onClick={() => router.push('/')} variant="link">Voltar ao catálogo</Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen bg-white transition-all duration-500 ${isFullscreen ? 'p-0 overflow-hidden' : 'p-6'}`}>
      
      {!isFullscreen && (
        <div className="max-w-2xl mx-auto w-full">
          <header className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full">
              <X className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-lora font-bold">{pattern.title}</h1>
            <div className="w-10" /> {/* Spacer */}
          </header>

          <div className="bg-zinc-100 rounded-3xl aspect-square flex items-center justify-center mb-8 overflow-hidden shadow-inner">
            <Image 
              src={pattern.image} 
              alt={pattern.title} 
              width={500} 
              height={500} 
              className="object-contain p-12 mix-blend-multiply opacity-80" 
            />
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
              <h3 className="font-bold mb-2">Instruções de Uso:</h3>
              <ul className="text-zinc-600 space-y-2 list-disc pl-5">
                <li>Coloque seu tecido sobre a tela do dispositivo.</li>
                <li>Ao ativar o modo Mesa de Luz, a tela ficará em brilho máximo.</li>
                <li>O toque na tela será desativado para evitar deslocamentos.</li>
                <li><strong>Para sair:</strong> Pressione o centro da tela por 2 segundos.</li>
              </ul>
            </div>

            <Button 
              onClick={toggleFullscreen}
              className="w-full h-16 rounded-full text-xl font-bold bg-charcoal hover:bg-charcoal/90 gap-3"
            >
              <Maximize2 className="w-6 h-6" />
              Ativar Mesa de Luz
            </Button>
          </div>
        </div>
      )}

      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[100] bg-white flex items-center justify-center cursor-none select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image 
              src={pattern.image} 
              alt={pattern.title} 
              fill
              className="object-contain invert-0 contrast-125 brightness-110" 
              priority
            />
            
            {/* Minimal Exit Indicator (Visible only briefly or subtly) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-300 text-xs font-medium uppercase tracking-[0.2em] opacity-20">
              Pressione para sair
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
