import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from './useSession';

export function useEmpresa() {
  const { session } = useSession();
  return useQuery({
    queryKey: ['empresa', session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('profile_id', session!.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
