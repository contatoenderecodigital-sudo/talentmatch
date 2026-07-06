import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Alerta, Botao, Carregando, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { useAtualizarStatus, useDeck } from '@/hooks/useDeck';
import { useVaga } from '@/hooks/useVagas';
import { escolaridadeAbaixo, leituraDoPerfil } from '@/lib/disc';
import { traduzErroBanco } from '@/lib/erros';
import type { CardDeck } from '@/types/database';

function BarraDisc({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <View className="mb-1 flex-row items-center gap-2">
      <Text className="w-4 text-xs font-semibold text-gray-500">{rotulo}</Text>
      <View className="h-2 flex-1 rounded-full bg-gray-100">
        <View className="h-2 rounded-full bg-primaria" style={{ width: `${Math.min(valor, 100)}%` }} />
      </View>
      <Text className="w-8 text-right text-xs text-gray-500">{valor}</Text>
    </View>
  );
}

export default function Deck() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vaga = useVaga(id);
  const deck = useDeck(id);
  const mudar = useAtualizarStatus(id);
  const [erro, setErro] = useState<string | null>(null);
  const [pulados, setPulados] = useState<string[]>([]);

  if (deck.isLoading || vaga.isLoading) return <Carregando />;

  // Triagem = novos e vistos (menos os pulados nesta sessão), na ordem de score da RPC.
  const fila = (deck.data ?? []).filter(
    (c) => (c.status === 'novo' || c.status === 'visto') && !pulados.includes(c.candidatura_id)
  );
  const atual: CardDeck | undefined = fila[0];
  const total = deck.data?.length ?? 0;

  function agir(status: 'descartado' | 'entrevistar') {
    if (!atual) return;
    setErro(null);
    mudar.mutate(
      { candidaturaId: atual.candidatura_id, status },
      { onError: (e) => setErro(traduzErroBanco(e.message)) }
    );
  }

  function pular() {
    if (!atual) return;
    setErro(null);
    if (atual.status === 'novo') {
      mudar.mutate(
        { candidaturaId: atual.candidatura_id, status: 'visto' },
        { onError: (e) => setErro(traduzErroBanco(e.message)) }
      );
    }
    setPulados((p) => [...p, atual.candidatura_id]);
  }

  if (!atual) {
    return (
      <Screen>
        <Titulo>Candidatos</Titulo>
        <Subtitulo>{vaga.data?.titulo}</Subtitulo>
        <Alerta tipo="info">
          {total === 0
            ? 'Ninguém respondeu o quiz ainda. Divulgue o link da vaga!'
            : 'Triagem em dia: todos os candidatos foram revisados.'}
        </Alerta>
        <Botao titulo="Ver entrevistas e descartados" variante="secundaria" onPress={() => router.push(`/(empresa)/vaga/${id}/funil`)} />
        <LinkTexto titulo="← Voltar pra vaga" onPress={() => router.push(`/(empresa)/vaga/${id}`)} />
      </Screen>
    );
  }

  const leitura = leituraDoPerfil({ d: atual.disc_d, i: atual.disc_i, s: atual.disc_s, c: atual.disc_c });
  const alertaEscolaridade = escolaridadeAbaixo(atual.escolaridade, vaga.data?.escolaridade_min ?? null);

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Titulo>Candidatos</Titulo>
        <Text className="text-sm text-gray-500">{fila.length} na fila</Text>
      </View>
      <Subtitulo>{vaga.data?.titulo}</Subtitulo>
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}

      <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-xl font-bold text-gray-900">{atual.nome}</Text>
            <Text className="text-gray-600">
              {atual.cidade}
              {atual.idade ? ` · ${atual.idade} anos` : ''}
              {atual.escolaridade ? ` · ${atual.escolaridade}` : ''}
            </Text>
          </View>
          <View className="items-center rounded-xl bg-emerald-50 px-3 py-2">
            <Text className="text-2xl font-bold text-primaria">{atual.score}%</Text>
            <Text className="text-xs text-primaria">de fit</Text>
          </View>
        </View>

        {alertaEscolaridade ? (
          <View className="mt-3">
            <Alerta tipo="info">Escolaridade abaixo do mínimo pedido na vaga — avalie mesmo assim.</Alerta>
          </View>
        ) : null}

        <Text className="mt-3 font-semibold text-gray-900">{leitura.rotulo}</Text>
        <Text className="mb-4 text-gray-700">{leitura.texto}</Text>

        <BarraDisc rotulo="D" valor={atual.disc_d} />
        <BarraDisc rotulo="I" valor={atual.disc_i} />
        <BarraDisc rotulo="S" valor={atual.disc_s} />
        <BarraDisc rotulo="C" valor={atual.disc_c} />
      </View>

      <Botao titulo="Quero entrevistar ✓" onPress={() => agir('entrevistar')} carregando={mudar.isPending} />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Botao titulo="Pular" variante="secundaria" onPress={pular} desabilitado={mudar.isPending} />
        </View>
        <View className="flex-1">
          <Botao titulo="Descartar" variante="perigo" onPress={() => agir('descartado')} desabilitado={mudar.isPending} />
        </View>
      </View>

      <LinkTexto titulo="Entrevistas e descartados" onPress={() => router.push(`/(empresa)/vaga/${id}/funil`)} />
      <LinkTexto titulo="← Voltar pra vaga" onPress={() => router.push(`/(empresa)/vaga/${id}`)} />
    </Screen>
  );
}
