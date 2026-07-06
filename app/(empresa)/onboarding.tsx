import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alerta, Botao, Campo, Screen, Subtitulo, Titulo } from '@/components/ui';
import { useSession } from '@/hooks/useSession';
import { traduzErroBanco } from '@/lib/erros';
import { supabase } from '@/lib/supabase';

const schema = z.object({
  nome: z.string().min(2, 'Informe o nome da empresa'),
  cnpj: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 14, 'CNPJ precisa ter 14 dígitos'),
  cidade: z.string().min(2, 'Informe a cidade'),
});
type Form = z.input<typeof schema>;

export default function Onboarding() {
  const { session } = useSession();
  const qc = useQueryClient();
  const [erro, setErro] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', cnpj: '', cidade: '' },
  });

  const salvar = handleSubmit(async (f) => {
    setErro(null);
    const { error } = await supabase.from('empresas').insert({
      profile_id: session!.user.id,
      nome: f.nome,
      cnpj: f.cnpj.replace(/\D/g, ''),
      cidade: f.cidade,
    });
    if (error) {
      setErro(traduzErroBanco(error.message));
      return;
    }
    await qc.invalidateQueries({ queryKey: ['empresa'] });
    router.replace('/(empresa)/plano');
  });

  return (
    <Screen>
      <Titulo>Sua empresa</Titulo>
      <Subtitulo>Só o essencial pra começar</Subtitulo>
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      <Controller
        control={control}
        name="nome"
        render={({ field: { onChange, value } }) => (
          <Campo rotulo="Nome da empresa" value={value} onChangeText={onChange} erro={errors.nome?.message} />
        )}
      />
      <Controller
        control={control}
        name="cnpj"
        render={({ field: { onChange, value } }) => (
          <Campo rotulo="CNPJ" value={value} onChangeText={onChange} keyboardType="number-pad" placeholder="Só números" erro={errors.cnpj?.message} />
        )}
      />
      <Controller
        control={control}
        name="cidade"
        render={({ field: { onChange, value } }) => (
          <Campo rotulo="Cidade" value={value} onChangeText={onChange} erro={errors.cidade?.message} />
        )}
      />
      <Botao titulo="Continuar" onPress={salvar} carregando={isSubmitting} />
    </Screen>
  );
}
