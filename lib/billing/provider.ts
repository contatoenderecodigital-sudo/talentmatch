// Interface de billing do DeuVaga (CLAUDE.md §2 — billing desacoplado).
// O resto do app SÓ conhece esta interface e os campos empresas.plano_tier/plano_status.
// A implementação real (gateway a decidir — P16) entra na Fase PAG sem tocar em nada fora
// de lib/billing/ e das edge functions de billing.
import type { PlanoTier } from '@/types/database';

export interface BillingProvider {
  /** Assina (ou troca) o plano da empresa logada. */
  assinar(tier: PlanoTier): Promise<void>;
}

export interface TierInfo {
  id: PlanoTier;
  nome: string;
  descricao: string;
}

// Números placeholder (P7 delegada) — validar com clientes reais antes da Fase PAG.
export const TIERS: TierInfo[] = [
  { id: 'basico', nome: 'Básico', descricao: '1 vaga aberta por vez' },
  { id: 'intermediario', nome: 'Intermediário', descricao: 'Até 3 vagas abertas' },
  { id: 'alto_volume', nome: 'Alto volume', descricao: 'Vagas ilimitadas' },
];
