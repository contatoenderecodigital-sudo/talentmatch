// Tipos do banco — escritos à mão na Fase 3 espelhando docs/data-model.md.
// Quando o projeto estiver linkado no CLI, regenerar com:
//   npx supabase gen types typescript --linked > types/database.ts
// e conferir que o diff é só cosmético.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type PlanoTier = 'basico' | 'intermediario' | 'alto_volume';
export type PlanoStatus = 'ativa' | 'inativa';
export type Modalidade = 'remoto' | 'presencial' | 'hibrido';
export type Periodo = 'integral' | 'meio' | 'flexivel';
export type Escolaridade = 'fundamental' | 'medio' | 'tecnico' | 'superior';
export type VagaStatus = 'aberta' | 'pausada' | 'fechada';
export type CandidaturaStatus = 'novo' | 'visto' | 'descartado' | 'entrevistar';

export interface CardDeck {
  candidatura_id: string;
  nome: string;
  cidade: string;
  idade: number | null;
  escolaridade: Escolaridade | null;
  disc_d: number;
  disc_i: number;
  disc_s: number;
  disc_c: number;
  score: number;
  status: CandidaturaStatus;
  created_at: string;
}

export interface VagaPublica {
  vaga_id: string;
  titulo: string;
  descricao: string | null;
  empresa_nome: string;
  cidade: string;
  modalidade: Modalidade;
  periodo: Periodo;
  escolaridade_min: Escolaridade | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: 'empresa'; created_at: string; updated_at: string };
        Insert: { id: string; role?: 'empresa' };
        Update: { role?: 'empresa' };
        Relationships: [];
      };
      empresas: {
        Row: {
          id: string;
          profile_id: string;
          nome: string;
          cnpj: string;
          cidade: string;
          plano_tier: PlanoTier | null;
          plano_status: PlanoStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: { id?: string; profile_id: string; nome: string; cnpj: string; cidade: string };
        Update: { nome?: string; cnpj?: string; cidade?: string };
        Relationships: [];
      };
      vagas: {
        Row: {
          id: string;
          empresa_id: string;
          titulo: string;
          descricao: string | null;
          modalidade: Modalidade;
          escolaridade_min: Escolaridade | null;
          periodo: Periodo;
          cidade: string;
          status: VagaStatus;
          disc_target_d: number;
          disc_target_i: number;
          disc_target_s: number;
          disc_target_c: number;
          quiz_token: string;
          quiz_ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          titulo: string;
          descricao?: string | null;
          modalidade: Modalidade;
          escolaridade_min?: Escolaridade | null;
          periodo: Periodo;
          cidade: string;
          status?: VagaStatus;
          disc_target_d: number;
          disc_target_i: number;
          disc_target_s: number;
          disc_target_c: number;
        };
        Update: {
          titulo?: string;
          descricao?: string | null;
          modalidade?: Modalidade;
          escolaridade_min?: Escolaridade | null;
          periodo?: Periodo;
          cidade?: string;
          status?: VagaStatus;
          disc_target_d?: number;
          disc_target_i?: number;
          disc_target_s?: number;
          disc_target_c?: number;
        };
        Relationships: [];
      };
      candidatos: {
        Row: {
          id: string;
          profile_id: string | null;
          nome: string;
          telefone: string;
          cidade: string;
          idade: number | null;
          escolaridade: Escolaridade | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          telefone: string;
          cidade: string;
          idade?: number | null;
          escolaridade?: Escolaridade | null;
        };
        Update: {
          nome?: string;
          cidade?: string;
          idade?: number | null;
          escolaridade?: Escolaridade | null;
        };
        Relationships: [];
      };
      candidaturas: {
        Row: {
          id: string;
          vaga_id: string;
          candidato_id: string;
          respostas: Json;
          disc_d: number;
          disc_i: number;
          disc_s: number;
          disc_c: number;
          score: number;
          status: CandidaturaStatus;
          consent_versao: string;
          consent_at: string;
          consent_pool: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          vaga_id: string;
          candidato_id: string;
          respostas: Json;
          disc_d: number;
          disc_i: number;
          disc_s: number;
          disc_c: number;
          score: number;
          status?: CandidaturaStatus;
          consent_versao: string;
          consent_at: string;
          consent_pool?: boolean;
        };
        Update: { status?: CandidaturaStatus };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_score: {
        Args: {
          d: number; i: number; s: number; c: number;
          dt: number; it: number; st: number; ct: number;
        };
        Returns: number;
      };
      get_deck: { Args: { p_vaga_id: string }; Returns: CardDeck[] };
      get_vaga_publica: { Args: { p_token: string }; Returns: VagaPublica[] };
      revelar_contato: {
        Args: { p_candidatura_id: string };
        Returns: { nome: string; telefone: string }[];
      };
      atualizar_status: {
        Args: { p_candidatura_id: string; p_novo_status: CandidaturaStatus };
        Returns: undefined;
      };
      selecionar_plano: { Args: { p_tier: PlanoTier }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
