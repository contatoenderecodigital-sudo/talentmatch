import { Redirect, Stack, useSegments } from 'expo-router';
import { Carregando } from '@/components/ui';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useSession } from '@/hooks/useSession';

export default function EmpresaLayout() {
  const { session, carregando } = useSession();
  const empresa = useEmpresa();
  const segments = useSegments() as string[];

  if (carregando) return <Carregando />;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (!session.user.email_confirmed_at) {
    return <Redirect href={{ pathname: '/(auth)/verificar-email', params: { email: session.user.email ?? '' } }} />;
  }
  if (empresa.isLoading) return <Carregando />;

  const emOnboarding = segments.includes('onboarding');
  if (!empresa.data && !emOnboarding) return <Redirect href="/(empresa)/onboarding" />;
  if (empresa.data && emOnboarding) return <Redirect href="/(empresa)/vagas" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
