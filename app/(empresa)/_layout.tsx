import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs, useSegments } from 'expo-router';
import { Carregando } from '@/components/ui';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useSession } from '@/hooks/useSession';
import { COR } from '@/lib/tema';

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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COR.marca,
        tabBarInactiveTintColor: '#9db3b0',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e6f4f1',
          borderTopWidth: 1,
          height: 64,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
      }}>
      <Tabs.Screen
        name="vagas"
        options={{
          title: 'Vagas',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plano"
        options={{
          title: 'Plano',
          tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="conta"
        options={{
          title: 'Conta',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
      {/* Rotas sem aba própria (navegadas por push) */}
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="vaga" options={{ href: null }} />
    </Tabs>
  );
}
