import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alerta, Botao, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { traduzErroAuth } from '@/lib/erros';
import { supabase } from '@/lib/supabase';

export default function VerificarEmail() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [aviso, setAviso] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function reenviar() {
    if (!email) return;
    setEnviando(true);
    setAviso(null);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setEnviando(false);
    setAviso(
      error
        ? { tipo: 'erro', texto: traduzErroAuth(error.message) }
        : { tipo: 'sucesso', texto: 'Email reenviado. Confira sua caixa de entrada e o spam.' }
    );
  }

  return (
    <Screen>
      <Titulo>Confirme seu email</Titulo>
      <Subtitulo>
        {email
          ? `Enviamos um link de confirmação pra ${email}. Clique nele pra ativar a conta.`
          : 'Enviamos um link de confirmação pro seu email. Clique nele pra ativar a conta.'}
      </Subtitulo>
      {aviso ? <Alerta tipo={aviso.tipo}>{aviso.texto}</Alerta> : null}
      {email ? <Botao titulo="Reenviar email" onPress={reenviar} carregando={enviando} variante="secundaria" /> : null}
      <LinkTexto titulo="Voltar pro login" onPress={() => router.replace('/(auth)/login')} />
    </Screen>
  );
}
