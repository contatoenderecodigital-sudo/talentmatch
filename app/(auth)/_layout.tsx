import { Redirect, Stack, usePathname } from 'expo-router';
import { useSession } from '@/hooks/useSession';

export default function AuthLayout() {
  const { session, carregando } = useSession();
  const pathname = usePathname();

  // A sessão de recuperação de senha NÃO pode ser expulsa da tela de redefinir.
  const redefinindo = pathname.includes('redefinir-senha');
  if (!carregando && session && session.user.email_confirmed_at && !redefinindo) {
    return <Redirect href="/(empresa)/vagas" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
