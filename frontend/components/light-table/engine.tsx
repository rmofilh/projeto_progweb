'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Maximize2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useScaleCalibration } from '@/src/presentation/hooks/useScaleCalibration';
import { ScaleEngine } from '@/src/domain/value_objects/ScaleEngine';
import { CalibrationOverlay } from '@/components/calibration-overlay';
import { Pattern } from '@/src/domain/entities/Pattern';

import { CheckCircle2, AlertTriangle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LightTableEngineProps {
  pattern: Pattern;
}

export function LightTableEngine({ pattern }: LightTableEngineProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [isDesktop] = useState(() => typeof window !== 'undefined' && !('ontouchstart' in window));
  const [hoopSize, setHoopSize] = useState<number | null>(null);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const thermalTimer = useRef<NodeJS.Timeout | null>(null);
  const { scale, saveCalibration, isCalibrated } = useScaleCalibration();

  // Wake Lock Logic
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
        console.log('Wake Lock active');
      } catch (err: unknown) {
        console.error(err instanceof Error ? `${err.name}, ${err.message}` : 'Wake Lock error');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
      if (thermalTimer.current) clearTimeout(thermalTimer.current);
    };
  }, [wakeLock]);

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
    if (thermalTimer.current) clearTimeout(thermalTimer.current);
  };

  // Escape key for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Fullscreen Logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        requestWakeLock();
        toast.success("Mesa de Luz Ativada", {
          description: isDesktop ? "Brilho máximo garantido. Pressione ESC ou clique na tela para sair." : "Brilho máximo garantido. Toque longo para sair."
        });

        thermalTimer.current = setTimeout(() => {
          toast.warning("Aviso Térmico", {
            description: "A tela está em brilho máximo há 5 minutos. Pode ser bom dar uma pausa para resfriar o aparelho.",
            duration: 8000
          });
        }, 5 * 60 * 1000); // 5 minutes
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      exitFullscreen();
    }
  };

  // Long Press Exit Logic (Mobile)
  const handleTouchStart = () => {
    if (isDesktop) return;
    longPressTimer.current = setTimeout(() => {
      exitFullscreen();
    }, 1500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const preventGestures = (e: React.TouchEvent | React.WheelEvent) => {
    if (!isDesktop) e.preventDefault();
  };

  return (
    <div className={`flex flex-col min-h-screen bg-white transition-all duration-500 ${isFullscreen ? 'p-0 overflow-hidden' : 'p-6'}`}>
      {!isFullscreen && (
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Image and Simulator */}
          <div>
            <header className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full shrink-0 bg-zinc-100">
                <X className="w-6 h-6" />
              </Button>
              <h1 className="text-2xl font-lora font-bold">{pattern.title}</h1>
            </header>

            <div className="bg-zinc-100 rounded-3xl aspect-square flex items-center justify-center mb-6 overflow-hidden shadow-inner relative group">
              <Image 
                src={pattern.imagePath} 
                alt={pattern.title} 
                width={500} 
                height={500} 
                className="object-contain p-12 mix-blend-multiply opacity-80" 
              />
              
              {/* Hoop Simulator Overlay */}
              {hoopSize && (
                <div 
                  className="absolute rounded-full border-4 border-amber-500/50 shadow-[0_0_0_9999px_rgba(255,255,255,0.6)] pointer-events-none transition-all duration-300"
                  style={{ 
                    width: `${(hoopSize / pattern.scaleCmReference) * 100}%`,
                    height: `${(hoopSize / pattern.scaleCmReference) * 100}%`
                  }}
                />
              )}
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Circle className="w-5 h-5 text-zinc-500" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-500">Simulador de Bastidor</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={hoopSize === null ? "default" : "secondary"} 
                  size="sm" 
                  onClick={() => setHoopSize(null)}
                  className="rounded-full"
                >
                  Ocultar
                </Button>
                {[10, 14, 18, 22].map(size => (
                  <Button 
                    key={size}
                    variant={hoopSize === size ? "default" : "secondary"} 
                    size="sm"
                    onClick={() => setHoopSize(size)}
                    className="rounded-full"
                  >
                    {size}cm
                  </Button>
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-3">
                Visualize como o risco de {pattern.scaleCmReference}cm ficará enquadrado no seu bastidor.
              </p>
            </div>
          </div>

          {/* Right Column: Controls and Info */}
          <div className="space-y-6 pt-2 lg:pt-16">
            <div className={cn("p-4 rounded-2xl border flex items-start gap-4", isCalibrated ? "bg-green-50 border-green-200 text-green-900" : "bg-amber-50 border-amber-200 text-amber-900")}>
              {isCalibrated ? <CheckCircle2 className="w-6 h-6 shrink-0 text-green-600 mt-1" /> : <AlertTriangle className="w-6 h-6 shrink-0 text-amber-600 mt-1" />}
              <div>
                <h3 className="font-bold">{isCalibrated ? "Calibrada ✅" : "Padrão (Não Calibrado) ⚠️"}</h3>
                <p className="text-sm opacity-80 mt-1">
                  {isCalibrated 
                    ? `Sua tela foi calibrada fisicamente. O tamanho real garantido é ${pattern.scaleCmReference}cm.` 
                    : "Calibre a tela usando um cartão magnético para garantir o tamanho físico real."}
                </p>
                <Button 
                  variant="link" 
                  className={cn("p-0 h-auto mt-2 font-bold", isCalibrated ? "text-green-700" : "text-amber-700")}
                  onClick={() => setShowCalibration(true)}
                >
                  {isCalibrated ? 'Recalibrar' : 'Calibrar agora'}
                </Button>
              </div>
            </div>

            <Button 
              onClick={toggleFullscreen}
              className="w-full h-16 rounded-2xl text-xl font-bold bg-charcoal hover:bg-charcoal/90 gap-3 shadow-lg"
            >
              <Maximize2 className="w-6 h-6" />
              Ativar Mesa de Luz
            </Button>

            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
              <h3 className="font-bold mb-2">Instruções de Uso:</h3>
              <ul className="text-zinc-600 space-y-2 list-disc pl-5 text-sm">
                <li>Aumente o brilho do seu aparelho ao máximo.</li>
                <li>Coloque seu tecido sobre a tela do dispositivo.</li>
                <li>O toque na tela será desativado para evitar deslocamentos.</li>
                <li><strong>Para sair:</strong> Pressione a tela por 2s (ou ESC no desktop).</li>
              </ul>
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
          className={`fixed inset-0 z-[100] bg-white flex items-center justify-center select-none ${isDesktop ? 'cursor-default' : 'cursor-none touch-none'}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={preventGestures}
          onWheel={preventGestures}
          onClick={isDesktop ? exitFullscreen : undefined}
          // @ts-expect-error - Safari-specific gesture event
          onGestureChange={preventGestures} 
        >
          {/* iOS Fallback WakeLock (Invisível) */}
          <video autoPlay loop muted playsInline className="hidden pointer-events-none" src="data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAACg8IUBgQGFh6CWAQAAAAAAACz1BAABAAAArB2FAYKGAQAAP9uGgQOFgQEBAQABAQAAAQEQgQQBAQEAoICBgICAgIKAAICAAAAAAAAFkAAAFuIAAAABfB2GAQBvY29kZWMDVP+BAAAABO2DgwGAgKCRgYCgoI2CAgMAAACqjg4BAQEAwIEEAQEBAKCAgYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAAICAgICAgICAhICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIKAAIAAAAAAAAAA" />


          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div 
              style={{ 
                width: `${ScaleEngine.cmToPixels(pattern.scaleCmReference, scale)}px`,
                aspectRatio: '1/1',
              }}
              className="relative transition-opacity duration-200"
            >
              <Image 
                src={pattern.imagePath} 
                alt={pattern.title} 
                fill
                className="object-contain invert-0 contrast-125 brightness-110 pointer-events-none" 
                priority
              />
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-300 text-xs font-medium uppercase tracking-[0.2em] opacity-30 pointer-events-none">
              {isDesktop ? 'Clique ou pressione ESC para sair' : 'Pressione para sair'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
