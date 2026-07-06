import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { VagaForm, type DadosVaga } from '@/components/VagaForm';
import { Carregando, LinkTexto, Screen, Titulo } from '@/components/ui';
import { useVaga, useVagaMutations } from '@/hooks/useVagas';
import { traduzErroBanco } from '@/lib/erros';

export default function EditarVaga() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vaga = useVaga(id);
  const { atualizar } = useVagaMutations();
  const [erro, setErro] = useState<string | null>(null);

  if (vaga.isLoading || !vaga.data) return <Carregando />;

  function salvar(dados: DadosVaga) {
    setErro(null);
    atualizar.mutate(
      { id: id!, patch: dados },
      {
        onSuccess: () => router.replace(`/(empresa)/vaga/${id}`),
        onError: (e) => setErro(traduzErroBanco(e.message)),
      }
    );
  }

  return (
    <Screen>
      <Titulo>Editar vaga</Titulo>
      <VagaForm inicial={vaga.data} onSalvar={salvar} salvando={atualizar.isPending} erro={erro} />
      <LinkTexto titulo="Cancelar" onPress={() => router.back()} />
    </Screen>
  );
}
