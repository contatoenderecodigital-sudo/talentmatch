import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Botao, Cabecalho, Cartao, Screen } from '@/components/ui';
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
      <Cabecalho titulo="Conta" subtitulo={session?.user.email ?? undefined} escuro />
      <Cartao>
        <Text className="text-lg font-bold text-tinta">{empresa.data?.nome}</Text>
        <Text className="text-[#5b6b6a]">CNPJ {empresa.data?.cnpj}</Text>
        <Text className="text-[#5b6b6a]">{empresa.data?.cidade}</Text>
        <View className="mt-3 self-start rounded-full bg-marca-50 px-3 py-1">
          <Text className="text-sm font-semibold text-primaria-escura">
            Plano: {tier ? tier.nome : 'nenhum'} · {empresa.data?.plano_status}
          </Text>
        </View>
      </Cartao>
      <Botao titulo="Trocar plano" variante="secundaria" onPress={() => router.push('/(empresa)/plano')} />
      <Botao titulo="Sair" variante="perigo" onPress={sair} />
    </Screen>
  );
}
