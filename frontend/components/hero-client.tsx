'use client';
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";

export function HeroClient() {
  const [showModal, setShowModal] = useState(false);

  const scrollToCatalog = () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={scrollToCatalog} size="lg" className="h-14 px-8 text-lg rounded-full bg-charcoal hover:bg-charcoal/90 transition-all">
          Ver Catálogo Completo
        </Button>
        <Button onClick={() => setShowModal(true)} size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-charcoal text-charcoal hover:bg-zinc-50">
          Como Funciona?
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full relative shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-charcoal transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <h3 className="text-3xl font-lora font-bold text-charcoal">Como Funciona a Mesa de Luz</h3>
            </div>
            <div className="space-y-6 text-zinc-600">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center font-bold shrink-0">1</div>
                <p className="mt-1">Navegue pelo catálogo e escolha um risco perfeito para o seu próximo projeto de bordado livre.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center font-bold shrink-0">2</div>
                <p className="mt-1">Calibre a tela usando um cartão magnético para garantir que o desenho tenha o tamanho físico real desejado.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center font-bold shrink-0">3</div>
                <p className="mt-1">Aumente o brilho, posicione o tecido sobre a tela do dispositivo e faça a transferência (decalque) facilmente.</p>
              </div>
            </div>
            <Button onClick={() => setShowModal(false)} className="w-full mt-8 bg-charcoal hover:bg-charcoal/90 text-white rounded-xl h-12 text-lg">
              Entendi, vamos começar!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
