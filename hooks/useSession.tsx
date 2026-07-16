import type { Session } from '@supabase/supabase-js';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type EstadoSessao = { session: Session | null; carregando: boolean };

// Fonte única da sessão. Sem isto, cada tela chamava getSession() de novo,
// começando em null — o que zerava a empresa por um instante e quebrava telas
// que dependem de empresa.data (ex.: nova vaga) ao navegar entre abas.
const SessaoContext = createContext<EstadoSessao>({ session: null, carregando: true });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return <SessaoContext.Provider value={{ session, carregando }}>{children}</SessaoContext.Provider>;
}

export function useSession() {
  return useContext(SessaoContext);
}
