// Única implementação do MVP: marca o plano como ativo SEM cobrança real.
// A escrita passa pela RPC selecionar_plano — único caminho permitido pelo banco (F1-1).
import { supabase } from '@/lib/supabase';
import type { PlanoTier } from '@/types/database';
import type { BillingProvider } from './provider';

export class MockBillingProvider implements BillingProvider {
  async assinar(tier: PlanoTier): Promise<void> {
    const { error } = await supabase.rpc('selecionar_plano', { p_tier: tier });
    if (error) throw new Error(error.message);
  }
}
