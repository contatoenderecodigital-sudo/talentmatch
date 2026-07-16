import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Alerta, Botao, Cabecalho, Carregando, Chip, Screen } from '@/components/ui';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useVagas } from '@/hooks/useVagas';
import { COR } from '@/lib/tema';

const TOM_STATUS = { aberta: 'verde', pausada: 'azul', fechada: 'cinza' } as const;

export default function Vagas() {
  const empresa = useEmpresa();
  const vagas = useVagas();

  if (vagas.isLoading) return <Carregando />;

  return (
    <Screen>
      <Cabecalho titulo="Minhas vagas" subtitulo={empresa.data?.nome ?? undefined} />

      {empresa.data?.plano_status !== 'ativa' ? (
        <>
          <Alerta tipo="info">Ative um plano pra abrir vagas.</Alerta>
          <Botao titulo="Escolher plano" variante="secundaria" onPress={() => router.push('/(empresa)/plano')} />
        </>
      ) : null}

      <Botao titulo="+ Nova vaga" onPress={() => router.push('/(empresa)/vaga/nova')} />

      {vagas.data?.length === 0 ? (
        <View className="mt-8 items-center px-6">
          <Ionicons name="briefcase-outline" size={44} color={COR.marcaClara} />
          <Text className="mt-3 text-center text-[15px] text-[#5b6b6a]">
            Nenhuma vaga ainda. Crie a primeira e compartilhe o link do quiz com seus candidatos.
          </Text>
        </View>
      ) : null}

      {vagas.data?.map((v) => (
        <Pressable
          key={v.id}
          accessibilityRole="button"
          onPress={() => router.push(`/(empresa)/vaga/${v.id}`)}
          className="mb-3 flex-row items-center rounded-2xl border border-marca-100 bg-white p-4"
          style={{ shadowColor: '#0b3b3a', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}>
          <View className="flex-1 pr-3">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="flex-1 pr-2 text-lg font-bold text-tinta">{v.titulo}</Text>
              <Chip texto={v.status} tom={TOM_STATUS[v.status]} />
            </View>
            <Text className="text-[#5b6b6a]">
              {v.cidade} · {v.periodo}
            </Text>
            <View className="mt-1.5 flex-row items-center gap-1">
              <Ionicons name="people-outline" size={14} color={COR.marca} />
              <Text className="text-sm font-medium text-primaria-escura">
                {v.candidaturas[0]?.count ?? 0} candidato(s)
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COR.cinzaFraco} />
        </Pressable>
      ))}
    </Screen>
  );
}
