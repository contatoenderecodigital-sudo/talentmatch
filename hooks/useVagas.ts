import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database, VagaStatus } from '@/types/database';
import { useEmpresa } from './useEmpresa';

export type Vaga = Database['public']['Tables']['vagas']['Row'];
export type VagaInsert = Database['public']['Tables']['vagas']['Insert'];
export type VagaUpdate = Database['public']['Tables']['vagas']['Update'];
export type VagaComContagem = Vaga & { candidaturas: { count: number }[] };

export function useVagas() {
  const empresa = useEmpresa();
  return useQuery({
    queryKey: ['vagas', empresa.data?.id],
    enabled: !!empresa.data,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vagas')
        .select('*, candidaturas(count)')
        .eq('empresa_id', empresa.data!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // O tipo escrito à mão não descreve o count aninhado — cast documentado.
      return data as unknown as VagaComContagem[];
    },
  });
}

export function useVaga(id: string | undefined) {
  return useQuery({
    queryKey: ['vaga', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('vagas').select('*').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useVagaMutations() {
  const qc = useQueryClient();
  const invalidar = () => {
    void qc.invalidateQueries({ queryKey: ['vagas'] });
    void qc.invalidateQueries({ queryKey: ['vaga'] });
  };

  const criar = useMutation({
    mutationFn: async (v: VagaInsert) => {
      const { data, error } = await supabase.from('vagas').insert(v).select('id').single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidar,
  });

  const atualizar = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: VagaUpdate }) => {
      const { error } = await supabase.from('vagas').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidar,
  });

  const mudarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: VagaStatus }) => {
      const { error } = await supabase.from('vagas').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidar,
  });

  return { criar, atualizar, mudarStatus };
}
