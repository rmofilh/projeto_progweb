'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Maximize2, X, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import { useScaleCalibration } from '@/src/adapters/hooks/useScaleCalibration';
import { ScaleEngine } from '@/src/domain/value_objects/ScaleEngine';
import { CalibrationOverlay } from '@/components/calibration-overlay';
import { Pattern } from '@/src/domain/entities/Pattern';

interface LightTableEngineProps {
  pattern: Pattern;
}

export function LightTableEngine({ pattern }: LightTableEngineProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const { scale, saveCalibration, isCalibrated } = useScaleCalibration();

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
    }, 1500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-white transition-all duration-500 ${isFullscreen ? 'p-0 overflow-hidden' : 'p-6'}`}>
      {!isFullscreen && (
        <div className="max-w-2xl mx-auto w-full">
          <header className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <X className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-lora font-bold">{pattern.title}</h1>
            <div className="w-10" />
          </header>

          <div className="bg-zinc-100 rounded-3xl aspect-square flex items-center justify-center mb-8 overflow-hidden shadow-inner">
            <Image 
              src={pattern.imagePath} 
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

            <div className="flex flex-col gap-3">
              <Button 
                onClick={toggleFullscreen}
                className="w-full h-16 rounded-full text-xl font-bold bg-charcoal hover:bg-charcoal/90 gap-3"
              >
                <Maximize2 className="w-6 h-6" />
                Ativar Mesa de Luz
              </Button>

              <Button 
                variant="ghost"
                onClick={() => setShowCalibration(true)}
                className="w-full h-12 rounded-full text-zinc-500 gap-2"
              >
                <Ruler className="w-4 h-4" />
                {isCalibrated ? 'Recalibrar Escala' : 'Calibrar Escala'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCalibration && (
        <CalibrationOverlay 
          onSave={(px) => {
            saveCalibration(px);
            setShowCalibration(false);
            toast.success("Calibração Salva");
          }}
          onClose={() => setShowCalibration(false)}
        />
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
            <div 
              style={{ 
                width: `${ScaleEngine.cmToPixels(pattern.scaleCmReference, scale)}px`,
                aspectRatio: '1/1'
              }}
              className="relative"
            >
              <Image 
                src={pattern.imagePath} 
                alt={pattern.title} 
                fill
                className="object-contain invert-0 contrast-125 brightness-110" 
                priority
              />
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-300 text-xs font-medium uppercase tracking-[0.2em] opacity-20">
              Pressione para sair
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
