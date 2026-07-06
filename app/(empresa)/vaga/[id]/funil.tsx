import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Alerta, Botao, Carregando, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { useAtualizarStatus, useDeck } from '@/hooks/useDeck';
import { useVaga } from '@/hooks/useVagas';
import { traduzErroBanco } from '@/lib/erros';
import { supabase } from '@/lib/supabase';
import type { CardDeck } from '@/types/database';

function LinhaCandidato({
  c,
  acao,
  onAcao,
  children,
}: {
  c: CardDeck;
  acao?: string;
  onAcao?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <View className="mb-3 rounded-xl border border-gray-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="font-semibold text-gray-900">{c.nome}</Text>
          <Text className="text-sm text-gray-600">
            {c.cidade} · {c.score}% de fit
          </Text>
        </View>
        {acao && onAcao ? (
          <Pressable accessibilityRole="button" onPress={onAcao} className="rounded-lg bg-gray-100 px-3 py-2">
            <Text className="text-sm text-gray-800">{acao}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export default function Funil() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vaga = useVaga(id);
  const deck = useDeck(id);
  const mudar = useAtualizarStatus(id);
  const [contatos, setContatos] = useState<Record<string, { nome: string; telefone: string }>>({});
  const [buscando, setBuscando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (deck.isLoading || vaga.isLoading) return <Carregando />;

  const entrevistar = (deck.data ?? []).filter((c) => c.status === 'entrevistar');
  const descartados = (deck.data ?? []).filter((c) => c.status === 'descartado');

  async function verContato(candidaturaId: string) {
    setErro(null);
    setBuscando(candidaturaId);
    const { data, error } = await supabase.rpc('revelar_contato', {
      p_candidatura_id: candidaturaId,
    });
    setBuscando(null);
    if (error) {
      setErro(traduzErroBanco(error.message));
      return;
    }
    const contato = data[0];
    if (contato) setContatos((m) => ({ ...m, [candidaturaId]: contato }));
  }

  function whatsapp(telefone: string) {
    void Linking.openURL(`https://wa.me/55${telefone}`);
  }

  function restaurar(candidaturaId: string) {
    setErro(null);
    mudar.mutate(
      { candidaturaId, status: 'visto' },
      { onError: (e) => setErro(traduzErroBanco(e.message)) }
    );
  }

  return (
    <Screen>
      <Titulo>Entrevistas</Titulo>
      <Subtitulo>{vaga.data?.titulo}</Subtitulo>
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}

      {entrevistar.length === 0 ? (
        <Alerta tipo="info">
          Ninguém marcado pra entrevista ainda. Marque {'"quero entrevistar"'} no deck — o contato
          do candidato é revelado aqui.
        </Alerta>
      ) : null}

      {entrevistar.map((c) => {
        const contato = contatos[c.candidatura_id];
        return (
          <LinhaCandidato key={c.candidatura_id} c={c}>
            {contato ? (
              <View className="mt-3">
                <Text className="mb-2 text-base text-gray-800">📞 {contato.telefone}</Text>
                <Botao titulo="Chamar no WhatsApp" onPress={() => whatsapp(contato.telefone)} />
              </View>
            ) : (
              <View className="mt-3">
                <Botao
                  titulo="Ver contato"
                  variante="secundaria"
                  onPress={() => verContato(c.candidatura_id)}
                  carregando={buscando === c.candidatura_id}
                />
              </View>
            )}
          </LinhaCandidato>
        );
      })}

      {descartados.length > 0 ? (
        <>
          <Text className="mb-2 mt-6 font-semibold text-gray-700">Descartados</Text>
          {descartados.map((c) => (
            <LinhaCandidato key={c.candidatura_id} c={c} acao="Restaurar" onAcao={() => restaurar(c.candidatura_id)} />
          ))}
        </>
      ) : null}

      <LinkTexto titulo="← Voltar pro deck" onPress={() => router.push(`/(empresa)/vaga/${id}/deck`)} />
      <LinkTexto titulo="← Voltar pra vaga" onPress={() => router.push(`/(empresa)/vaga/${id}`)} />
    </Screen>
  );
}
