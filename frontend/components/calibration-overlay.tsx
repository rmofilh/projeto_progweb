'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Ruler, CreditCard, Check } from 'lucide-react';

interface CalibrationOverlayProps {
  onSave: (pixelsPerCm: number) => void;
  onClose: () => void;
}

export function CalibrationOverlay({ onSave, onClose }: CalibrationOverlayProps) {
  // 38px/cm é uma base comum. Vamos deixar o usuário ajustar.
  const [pixelsPerCm, setPixelsPerCm] = useState(38);
  
  // Referência visual: Cartão de crédito tem 8.56cm de largura
  const creditCardWidthCm = 8.56;
  const currentCardWidthPx = creditCardWidthCm * pixelsPerCm;

  return (
    <div className="fixed inset-0 z-[200] bg-charcoal/90 backdrop-blur-md flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-charcoal text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Ruler className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-lora font-bold">Calibração de Escala</CardTitle>
          <CardDescription>
            Ajuste a régua abaixo para que ela tenha o mesmo tamanho de um cartão físico (crédito/débito).
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-4">
          {/* Cartão de Referência Visual */}
          <div className="flex flex-col items-center">
            <div 
              className="bg-zinc-200 rounded-xl border-2 border-dashed border-zinc-400 flex items-center justify-center relative transition-all duration-75"
              style={{ width: `${currentCardWidthPx}px`, height: `${currentCardWidthPx * 0.63}px` }}
            >
              <CreditCard className="text-zinc-400 w-1/3 h-1/3" />
              <div className="absolute -bottom-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Posicione seu cartão aqui
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl"
              onClick={() => setPixelsPerCm(prev => Math.max(10, prev - 0.5))}
            >
              - Menor
            </Button>
            <div className="text-center min-w-20">
              <span className="text-xl font-bold">{pixelsPerCm.toFixed(1)}</span>
              <span className="text-xs block text-zinc-400">px/cm</span>
            </div>
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl"
              onClick={() => setPixelsPerCm(prev => prev + 0.5)}
            >
              + Maior
            </Button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="flex-1 h-12 rounded-xl bg-charcoal gap-2" onClick={() => onSave(pixelsPerCm)}>
              <Check className="w-4 h-4" />
              Salvar Calibração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
