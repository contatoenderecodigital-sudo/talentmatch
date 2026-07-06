import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CandidaturaStatus } from '@/types/database';

export function useDeck(vagaId: string | undefined) {
  return useQuery({
    queryKey: ['deck', vagaId],
    enabled: !!vagaId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_deck', { p_vaga_id: vagaId! });
      if (error) throw error;
      return data; // já vem ordenado por score desc
    },
  });
}

export function useAtualizarStatus(vagaId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      candidaturaId,
      status,
    }: {
      candidaturaId: string;
      status: CandidaturaStatus;
    }) => {
      const { error } = await supabase.rpc('atualizar_status', {
        p_candidatura_id: candidaturaId,
        p_novo_status: status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['deck', vagaId] });
      void qc.invalidateQueries({ queryKey: ['vagas'] });
    },
  });
}
