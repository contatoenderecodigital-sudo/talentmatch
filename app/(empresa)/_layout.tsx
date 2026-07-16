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
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.65)',
        tabBarShowLabel: true,
        // Dock flutuante arredondado (cara de app premium)
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 66,
          borderRadius: 24,
          borderTopWidth: 0,
          backgroundColor: COR.marcaEscura,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 8,
          shadowColor: '#0b3b3a',
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
        },
        tabBarItemStyle: { borderRadius: 16, marginHorizontal: 4 },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
      }}>
      <Tabs.Screen
        name="vagas"
        options={{
          title: 'Vagas',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={23} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plano"
        options={{
          title: 'Plano',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'card' : 'card-outline'} size={23} color={color} />,
        }}
      />
      <Tabs.Screen
        name="conta"
        options={{
          title: 'Conta',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={24} color={color} />,
        }}
      />
      {/* Rotas sem aba própria: escondem o dock e usam CTA/dock próprio */}
      <Tabs.Screen name="onboarding" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="vaga" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
