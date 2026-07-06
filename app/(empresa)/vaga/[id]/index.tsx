import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Alerta, Botao, Carregando, Chip, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { useVaga, useVagaMutations } from '@/hooks/useVagas';
import { traduzErroBanco } from '@/lib/erros';
import { quizUrl } from '@/lib/links';

export default function DetalheVaga() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vaga = useVaga(id);
  const { mudarStatus } = useVagaMutations();
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmaFechar, setConfirmaFechar] = useState(false);

  if (vaga.isLoading || !vaga.data) return <Carregando />;
  const v = vaga.data;
  const url = quizUrl(v.quiz_token);

  async function copiar() {
    await Clipboard.setStringAsync(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function status(novo: 'aberta' | 'pausada' | 'fechada') {
    setErro(null);
    setConfirmaFechar(false);
    mudarStatus.mutate({ id: v.id, status: novo }, { onError: (e) => setErro(traduzErroBanco(e.message)) });
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Titulo>{v.titulo}</Titulo>
        <Chip texto={v.status} tom={v.status === 'aberta' ? 'verde' : v.status === 'pausada' ? 'azul' : 'cinza'} />
      </View>
      <Subtitulo>
        {v.cidade} · {v.modalidade} · {v.periodo}
      </Subtitulo>
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}

      <View className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
        <Text className="mb-1 font-semibold text-gray-900">Link do quiz</Text>
        {v.quiz_ativo ? (
          <>
            <Text className="mb-3 text-sm text-gray-600" selectable>
              {url}
            </Text>
            <View className="mb-3 items-center">
              <QRCode value={url} size={160} />
            </View>
            <Botao titulo={copiado ? 'Copiado!' : 'Copiar link'} variante="secundaria" onPress={copiar} />
            <Text className="text-center text-xs text-gray-500">
              Divulgue no Instagram, WhatsApp ou imprima o QR no mural.
            </Text>
          </>
        ) : (
          <Text className="text-sm text-gray-500">
            Link desativado — vaga {v.status}. Reabra a vaga pra reativar o mesmo link.
          </Text>
        )}
      </View>

      <Botao titulo="Ver candidatos (deck)" onPress={() => router.push(`/(empresa)/vaga/${v.id}/deck`)} />
      <Botao titulo="Entrevistas" variante="secundaria" onPress={() => router.push(`/(empresa)/vaga/${v.id}/funil`)} />
      <Botao titulo="Editar vaga" variante="secundaria" onPress={() => router.push(`/(empresa)/vaga/${v.id}/editar`)} />

      {v.status === 'aberta' ? (
        <Botao titulo="Pausar vaga (desativa o link)" variante="secundaria" onPress={() => status('pausada')} carregando={mudarStatus.isPending} />
      ) : null}
      {v.status === 'pausada' ? (
        <Botao titulo="Reabrir vaga" variante="secundaria" onPress={() => status('aberta')} carregando={mudarStatus.isPending} />
      ) : null}
      {v.status !== 'fechada' ? (
        confirmaFechar ? (
          <>
            <Alerta tipo="info">Fechar é definitivo pro link (dá pra reabrir depois). Confirma?</Alerta>
            <Botao titulo="Confirmar fechamento" variante="perigo" onPress={() => status('fechada')} carregando={mudarStatus.isPending} />
            <LinkTexto titulo="Cancelar" onPress={() => setConfirmaFechar(false)} />
          </>
        ) : (
          <Botao titulo="Fechar vaga" variante="perigo" onPress={() => setConfirmaFechar(true)} />
        )
      ) : (
        <Botao titulo="Reabrir vaga" variante="secundaria" onPress={() => status('aberta')} carregando={mudarStatus.isPending} />
      )}

      <LinkTexto titulo="← Minhas vagas" onPress={() => router.push('/(empresa)/vagas')} />
    </Screen>
  );
}
