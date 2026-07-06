import { zodResolver } from '@hookform/resolvers/zod';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alerta, Botao, Campo, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { traduzErroAuth } from '@/lib/erros';
import { supabase } from '@/lib/supabase';

const schema = z.object({ email: z.email('Email inválido') });
type Form = z.infer<typeof schema>;

export default function Recuperar() {
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const enviar = handleSubmit(async ({ email }) => {
    setErro(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL('/redefinir-senha'),
    });
    if (error) {
      setErro(traduzErroAuth(error.message));
      return;
    }
    setEnviado(true);
  });

  return (
    <Screen>
      <Titulo>Recuperar senha</Titulo>
      <Subtitulo>Enviamos um link de redefinição pro seu email</Subtitulo>
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {enviado ? (
        <Alerta tipo="sucesso">
          Se esse email tiver conta, o link de redefinição chega em instantes.
        </Alerta>
      ) : (
        <>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Campo
                rotulo="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                erro={errors.email?.message}
              />
            )}
          />
          <Botao titulo="Enviar link" onPress={enviar} carregando={isSubmitting} />
        </>
      )}
      <LinkTexto titulo="Voltar pro login" onPress={() => router.replace('/(auth)/login')} />
    </Screen>
  );
}
