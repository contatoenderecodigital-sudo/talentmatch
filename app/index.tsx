import { Redirect } from 'expo-router';
import { Carregando } from '@/components/ui';
import { useSession } from '@/hooks/useSession';

export default function Index() {
  const { session, carregando } = useSession();
  if (carregando) return <Carregando />;
  return <Redirect href={session ? '/(empresa)/vagas' : '/(auth)/login'} />;
}
