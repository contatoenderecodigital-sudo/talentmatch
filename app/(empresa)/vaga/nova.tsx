import { router } from 'expo-router';
import { useState } from 'react';
import { VagaForm, type DadosVaga } from '@/components/VagaForm';
import { Carregando, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useVagaMutations } from '@/hooks/useVagas';
import { traduzErroBanco } from '@/lib/erros';

export default function NovaVaga() {
  const empresa = useEmpresa();
  const { criar } = useVagaMutations();
  const [erro, setErro] = useState<string | null>(null);

  // Sem a empresa carregada não dá pra criar vaga — evita crash em branco.
  if (empresa.isLoading || !empresa.data) return <Carregando />;
  const empresaId = empresa.data.id;

  function salvar(dados: DadosVaga) {
    setErro(null);
    criar.mutate(
      { empresa_id: empresaId, ...dados },
      {
        onSuccess: (v) => router.replace(`/(empresa)/vaga/${v.id}`),
        onError: (e) => setErro(traduzErroBanco(e.message)),
      }
    );
  }

  return (
    <Screen>
      <Titulo>Nova vaga</Titulo>
      <Subtitulo>Ao criar, você recebe o link do quiz pra distribuir</Subtitulo>
      <VagaForm onSalvar={salvar} salvando={criar.isPending} erro={erro} />
      <LinkTexto titulo="Cancelar" onPress={() => router.back()} />
    </Screen>
  );
}
