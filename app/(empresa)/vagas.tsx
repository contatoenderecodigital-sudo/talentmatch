import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Alerta, Botao, Cabecalho, Carregando, Chip, FAB, Screen } from '@/components/ui';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useVagas } from '@/hooks/useVagas';
import { COR } from '@/lib/tema';

const TOM_STATUS = { aberta: 'verde', pausada: 'azul', fechada: 'cinza' } as const;
const COR_STATUS = { aberta: COR.marca, pausada: COR.oceano, fechada: '#9db3b0' } as const;

export default function Vagas() {
  const empresa = useEmpresa();
  const vagas = useVagas();

  if (vagas.isLoading) return <Carregando />;

  const lista = vagas.data ?? [];
  const totalCand = lista.reduce((s, v) => s + (v.candidaturas[0]?.count ?? 0), 0);
  const ativa = empresa.data?.plano_status === 'ativa';

  return (
    <Screen flutuante={ativa ? <FAB titulo="Nova vaga" onPress={() => router.push('/(empresa)/vaga/nova')} /> : undefined}>
      <Cabecalho
        titulo="Minhas vagas"
        subtitulo={empresa.data?.nome ?? undefined}
        direita={<Chip texto={ativa ? 'Plano ativo' : 'Sem plano'} tom={ativa ? 'verde' : 'cinza'} />}>
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-white/15 px-4 py-3">
            <Text className="text-2xl font-extrabold text-white">{lista.length}</Text>
            <Text className="text-xs font-medium text-white/80">vagas</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-white/15 px-4 py-3">
            <Text className="text-2xl font-extrabold text-white">{totalCand}</Text>
            <Text className="text-xs font-medium text-white/80">candidatos</Text>
          </View>
        </View>
      </Cabecalho>

      {!ativa ? (
        <>
          <Alerta tipo="info">Ative um plano pra abrir vagas.</Alerta>
          <Botao titulo="Escolher plano" onPress={() => router.push('/(empresa)/plano')} />
        </>
      ) : null}

      {lista.length === 0 && ativa ? (
        <View className="mt-10 items-center px-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-marca-100">
            <Ionicons name="briefcase-outline" size={30} color={COR.marca} />
          </View>
          <Text className="mt-4 text-center text-[15px] text-[#5b6b6a]">
            Nenhuma vaga ainda. Toque em <Text className="font-bold text-primaria-escura">Nova vaga</Text> e compartilhe o link do quiz com seus candidatos.
          </Text>
        </View>
      ) : null}

      {lista.map((v) => (
        <Pressable
          key={v.id}
          accessibilityRole="button"
          onPress={() => router.push(`/(empresa)/vaga/${v.id}`)}
          className="mb-3 flex-row items-center overflow-hidden rounded-2xl border border-marca-100 bg-white"
          style={{ shadowColor: '#0b3b3a', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
          <View style={{ width: 5, alignSelf: 'stretch', backgroundColor: COR_STATUS[v.status] }} />
          <View className="flex-1 py-4 pl-4 pr-3">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="flex-1 pr-2 text-[17px] font-bold text-tinta">{v.titulo}</Text>
              <Chip texto={v.status} tom={TOM_STATUS[v.status]} />
            </View>
            <Text className="text-[13px] text-[#5b6b6a]">
              {v.cidade} · {v.periodo}
            </Text>
            <View className="mt-2 flex-row items-center gap-1.5">
              <Ionicons name="people" size={15} color={COR.marca} />
              <Text className="text-sm font-bold text-primaria-escura">{v.candidaturas[0]?.count ?? 0}</Text>
              <Text className="text-sm text-[#5b6b6a]">candidatos</Text>
            </View>
          </View>
          <View className="pr-3">
            <Ionicons name="chevron-forward" size={20} color={COR.cinzaFraco} />
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}
