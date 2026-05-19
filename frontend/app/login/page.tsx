'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authCubit } from '@/src/application/auth/AuthCubit';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await authCubit.requestMagicLink(email);
      toast.success('Link mágico enviado!', {
        description: 'Verifique sua caixa de entrada (ou spam) para acessar seu Baú.',
      });
      setEmail('');
    } catch (error) {
      toast.error('Ocorreu um erro.', {
        description: 'Não foi possível enviar o link agora.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-alabaster font-outfit text-charcoal">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg text-center border">
          <h1 className="text-3xl font-lora font-bold mb-2">Acessar meu Baú</h1>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            Nós usamos <strong className="text-charcoal font-semibold">Links Mágicos</strong>. Sem senhas para esquecer, basta digitar seu e-mail e enviaremos o acesso direto para você.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input 
              type="email" 
              placeholder="seu.email@exemplo.com" 
              className="h-14 rounded-full text-center text-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="h-14 rounded-full bg-charcoal hover:bg-charcoal/90 text-lg font-medium"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Receber Link Mágico'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
