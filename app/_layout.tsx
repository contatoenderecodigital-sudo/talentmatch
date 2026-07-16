import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { SessionProvider } from '@/hooks/useSession';
import { configOk } from '@/lib/supabase';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function ErroConfig() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-8">
      <Text className="mb-2 text-xl font-bold text-gray-900">Configuração faltando</Text>
      <Text className="max-w-md text-center text-gray-600">
        As variáveis EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY não foram
        encontradas. No deploy (Vercel), cadastre-as em Environment Variables e faça um novo
        deploy (as variáveis são incorporadas durante o build).
      </Text>
    </View>
  );
}

export default function RootLayout() {
  if (!configOk) return <ErroConfig />;
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SessionProvider>
    </QueryClientProvider>
  );
}
