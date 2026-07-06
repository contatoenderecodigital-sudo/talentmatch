import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alerta, Botao, Campo, Screen, Subtitulo, Titulo } from '@/components/ui';
import { useSession } from '@/hooks/useSession';
import { traduzErroAuth } from '@/lib/erros';
import { supabase } from '@/lib/supabase';

const schema = z
  .object({
    senha: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, {
    message: 'As senhas não conferem',
    path: ['confirmar'],
  });
type Form = z.infer<typeof schema>;

export default function RedefinirSenha() {
  const { session, carregando } = useSession();
  const [erro, setErro] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { senha: '', confirmar: '' } });

  const salvar = handleSubmit(async ({ senha }) => {
    setErro(null);
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setErro(traduzErroAuth(error.message));
      return;
    }
    router.replace('/');
  });

  return (
    <Screen>
      <Titulo>Nova senha</Titulo>
      <Subtitulo>Defina a nova senha da sua conta</Subtitulo>
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {!carregando && !session ? (
        <Alerta tipo="erro">
          Link inválido ou expirado. Peça a recuperação de senha de novo.
        </Alerta>
      ) : (
        <>
          <Controller
            control={control}
            name="senha"
            render={({ field: { onChange, value } }) => (
              <Campo
                rotulo="Nova senha"
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
                rotulo="Confirmar nova senha"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                erro={errors.confirmar?.message}
              />
            )}
          />
          <Botao titulo="Salvar nova senha" onPress={salvar} carregando={isSubmitting} />
        </>
      )}
    </Screen>
  );
}
