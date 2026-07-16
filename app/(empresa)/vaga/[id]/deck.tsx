import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Alerta, Avatar, BarraDisc, BotaoCircular, Botao, Cabecalho, Carregando, Cartao, LinkTexto, Screen, SeloScore } from '@/components/ui';
import { useAtualizarStatus, useDeck } from '@/hooks/useDeck';
import { useVaga } from '@/hooks/useVagas';
import { escolaridadeAbaixo, leituraDoPerfil } from '@/lib/disc';
import { traduzErroBanco } from '@/lib/erros';
import type { CardDeck } from '@/types/database';

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
        <Cabecalho titulo="Candidatos" subtitulo={vaga.data?.titulo} aoVoltar={() => router.push(`/(empresa)/vaga/${id}`)} />
        <Alerta tipo="info">
          {total === 0
            ? 'Ninguém respondeu o quiz ainda. Divulgue o link da vaga!'
            : 'Triagem em dia: todos os candidatos foram revisados.'}
        </Alerta>
        <Botao titulo="Ver entrevistas e descartados" variante="secundaria" onPress={() => router.push(`/(empresa)/vaga/${id}/funil`)} />
      </Screen>
    );
  }

  const leitura = leituraDoPerfil({ d: atual.disc_d, i: atual.disc_i, s: atual.disc_s, c: atual.disc_c });
  const alertaEscolaridade = escolaridadeAbaixo(atual.escolaridade, vaga.data?.escolaridade_min ?? null);

  const dock = (
    <View className="flex-row items-center justify-center gap-6">
      <BotaoCircular icone="close" variante="nao" onPress={() => agir('descartado')} desabilitado={mudar.isPending} />
      <BotaoCircular icone="checkmark" variante="sim" grande onPress={() => agir('entrevistar')} desabilitado={mudar.isPending} />
      <BotaoCircular icone="play-skip-forward" variante="neutro" onPress={pular} desabilitado={mudar.isPending} />
    </View>
  );

  return (
    <Screen rodape={dock}>
      <Cabecalho
        titulo="Candidatos"
        subtitulo={vaga.data?.titulo}
        aoVoltar={() => router.push(`/(empresa)/vaga/${id}`)}
        direita={<Text className="text-sm font-semibold text-white/90">{fila.length} na fila</Text>}
      />
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}

      <Cartao>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3 pr-2">
            <Avatar nome={atual.nome} tam={54} />
            <View className="flex-1">
              <Text className="text-xl font-extrabold text-tinta">{atual.nome}</Text>
              <Text className="text-[13px] text-[#5b6b6a]">
                {atual.cidade}
                {atual.idade ? ` · ${atual.idade} anos` : ''}
                {atual.escolaridade ? ` · ${atual.escolaridade}` : ''}
              </Text>
            </View>
          </View>
          <SeloScore valor={atual.score} />
        </View>

        {alertaEscolaridade ? (
          <View className="mt-3">
            <Alerta tipo="info">Escolaridade abaixo do mínimo pedido na vaga — avalie mesmo assim.</Alerta>
          </View>
        ) : null}

        <Text className="mt-4 font-bold text-tinta">{leitura.rotulo}</Text>
        <Text className="mb-4 text-[#33514f]">{leitura.texto}</Text>

        <BarraDisc rotulo="D" valor={atual.disc_d} />
        <BarraDisc rotulo="I" valor={atual.disc_i} />
        <BarraDisc rotulo="S" valor={atual.disc_s} />
        <BarraDisc rotulo="C" valor={atual.disc_c} />
      </Cartao>

      <LinkTexto titulo="Ver entrevistas e descartados" onPress={() => router.push(`/(empresa)/vaga/${id}/funil`)} />
    </Screen>
  );
}
