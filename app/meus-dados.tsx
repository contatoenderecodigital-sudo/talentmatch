import { router } from 'expo-router';
import { useState } from 'react';
import { Alerta, Botao, Campo, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { normalizaTelefone } from '@/supabase/functions/_shared/scoring';

// Canal LGPD do candidato sem conta (RN-13): registra pedido de exclusão/exportação.
export default function MeusDados() {
  const [telefone, setTelefone] = useState('');
  const [enviando, setEnviando] = useState<'exclusao' | 'exportacao' | null>(null);
  const [feito, setFeito] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function pedir(tipo: 'exclusao' | 'exportacao') {
    setErro(null);
    if (!normalizaTelefone(telefone)) {
      setErro('Confira o telefone: use DDD + número (ex.: 49 99999-9999).');
      return;
    }
    setEnviando(tipo);
    const { error } = await supabase.functions.invoke('lgpd-request', {
      body: { telefone, tipo },
    });
    setEnviando(null);
    if (error) {
      setErro('Não foi possível registrar o pedido. Tente de novo em instantes.');
      return;
    }
    setFeito(true);
  }

  return (
    <Screen>
      <Titulo>Meus dados</Titulo>
      <Subtitulo>Exclusão definitiva ou cópia dos seus dados (LGPD)</Subtitulo>
      {feito ? (
        <Alerta tipo="sucesso">
          Pedido registrado. Ele será processado em até 7 dias úteis, com confirmação pelo
          WhatsApp informado.
        </Alerta>
      ) : (
        <>
          {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
          <Campo
            rotulo="Telefone usado na candidatura"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="49 99999-9999"
          />
          <Botao
            titulo="Quero excluir meus dados"
            variante="perigo"
            onPress={() => pedir('exclusao')}
            carregando={enviando === 'exclusao'}
          />
          <Botao
            titulo="Quero uma cópia dos meus dados"
            variante="secundaria"
            onPress={() => pedir('exportacao')}
            carregando={enviando === 'exportacao'}
          />
        </>
      )}
      <LinkTexto titulo="← Voltar" onPress={() => router.back()} />
    </Screen>
  );
}
