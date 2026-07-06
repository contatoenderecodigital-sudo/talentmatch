import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Botao, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useSession } from '@/hooks/useSession';
import { TIERS } from '@/lib/billing';
import { supabase } from '@/lib/supabase';

export default function Conta() {
  const { session } = useSession();
  const empresa = useEmpresa();
  const tier = TIERS.find((t) => t.id === empresa.data?.plano_tier);

  async function sair() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  return (
    <Screen>
      <Titulo>Conta</Titulo>
      <Subtitulo>{session?.user.email}</Subtitulo>
      <View className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <Text className="text-lg font-semibold text-gray-900">{empresa.data?.nome}</Text>
        <Text className="text-gray-600">CNPJ {empresa.data?.cnpj}</Text>
        <Text className="text-gray-600">{empresa.data?.cidade}</Text>
        <Text className="mt-2 text-sm text-gray-500">
          Plano: {tier ? tier.nome : 'nenhum'} ({empresa.data?.plano_status})
        </Text>
      </View>
      <Botao titulo="Trocar plano" variante="secundaria" onPress={() => router.push('/(empresa)/plano')} />
      <Botao titulo="Sair" variante="perigo" onPress={sair} />
      <LinkTexto titulo="Voltar" onPress={() => router.back()} />
    </Screen>
  );
}
