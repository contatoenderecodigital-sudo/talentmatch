import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alerta, Botao, Campo, LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { traduzErroAuth } from '@/lib/erros';
import { supabase } from '@/lib/supabase';

const schema = z.object({
  email: z.email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const [erro, setErro] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '', senha: '' } });

  const entrar = handleSubmit(async ({ email, senha }) => {
    setErro(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro(traduzErroAuth(error.message));
      return;
    }
    router.replace('/');
  });

  return (
    <Screen>
      <Titulo>DeuVaga</Titulo>
      <Subtitulo>Entre com a conta da sua empresa</Subtitulo>
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
      <Botao titulo="Entrar" onPress={entrar} carregando={isSubmitting} />
      <LinkTexto titulo="Esqueci minha senha" onPress={() => router.push('/(auth)/recuperar')} />
      <LinkTexto titulo="Criar conta da empresa" onPress={() => router.push('/(auth)/cadastro')} />
    </Screen>
  );
}
