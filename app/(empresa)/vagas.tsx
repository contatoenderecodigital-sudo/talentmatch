import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Alerta, Botao, Carregando, Chip, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useVagas } from '@/hooks/useVagas';

const TOM_STATUS = { aberta: 'verde', pausada: 'azul', fechada: 'cinza' } as const;

export default function Vagas() {
  const empresa = useEmpresa();
  const vagas = useVagas();

  if (vagas.isLoading) return <Carregando />;

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Titulo>Minhas vagas</Titulo>
        <LinkTexto titulo="Conta" onPress={() => router.push('/(empresa)/conta')} />
      </View>
      <Subtitulo>{empresa.data?.nome}</Subtitulo>

      {empresa.data?.plano_status !== 'ativa' ? (
        <Alerta tipo="info">
          Ative um plano pra abrir vagas.{' '}
        </Alerta>
      ) : null}
      {empresa.data?.plano_status !== 'ativa' ? (
        <Botao titulo="Escolher plano" variante="secundaria" onPress={() => router.push('/(empresa)/plano')} />
      ) : null}

      <Botao titulo="+ Nova vaga" onPress={() => router.push('/(empresa)/vaga/nova')} />

      {vagas.data?.length === 0 ? (
        <Text className="mt-6 text-center text-gray-500">
          Nenhuma vaga ainda. Crie a primeira e compartilhe o link do quiz com seus candidatos.
        </Text>
      ) : null}

      {vagas.data?.map((v) => (
        <Pressable
          key={v.id}
          accessibilityRole="button"
          onPress={() => router.push(`/(empresa)/vaga/${v.id}`)}
          className="mb-3 rounded-xl border border-gray-200 bg-white p-4">
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-lg font-semibold text-gray-900">{v.titulo}</Text>
            <Chip texto={v.status} tom={TOM_STATUS[v.status]} />
          </View>
          <Text className="text-gray-600">
            {v.cidade} · {v.periodo}
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            {v.candidaturas[0]?.count ?? 0} candidato(s)
          </Text>
        </Pressable>
      ))}
    </Screen>
  );
}
