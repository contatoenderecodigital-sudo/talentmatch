import { zodResolver } from '@hookform/resolvers/zod';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alerta, Botao, Campo, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { traduzErroAuth } from '@/lib/erros';
import { supabase } from '@/lib/supabase';

const schema = z
  .object({
    email: z.email('Email inválido'),
    senha: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, {
    message: 'As senhas não conferem',
    path: ['confirmar'],
  });
type Form = z.infer<typeof schema>;

export default function Cadastro() {
  const [erro, setErro] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', senha: '', confirmar: '' },
  });

  const cadastrar = handleSubmit(async ({ email, senha }) => {
    setErro(null);
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: Linking.createURL('/') },
    });
    if (error) {
      setErro(traduzErroAuth(error.message));
      return;
    }
    router.replace({ pathname: '/(auth)/verificar-email', params: { email } });
  });

  return (
    <Screen>
      <Titulo>Criar conta</Titulo>
      <Subtitulo>Conta da empresa — candidatos não precisam de conta</Subtitulo>
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
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
      <Controller
        control={control}
        name="senha"
        render={({ field: { onChange, value } }) => (
          <Campo
            rotulo="Senha"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            erro={errors.senha?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmar"
        render={({ field: { onChange, value } }) => (
          <Campo
            rotulo="Confirmar senha"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            erro={errors.confirmar?.message}
          />
        )}
      />
      <Botao titulo="Criar conta" onPress={cadastrar} carregando={isSubmitting} />
      <LinkTexto titulo="Já tenho conta" onPress={() => router.replace('/(auth)/login')} />
    </Screen>
  );
}
