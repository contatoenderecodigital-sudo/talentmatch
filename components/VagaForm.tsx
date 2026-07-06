import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';
import { Alerta, Botao, Campo, Selecao } from '@/components/ui';
import { ALVO_NEUTRO, ALVOS_CARGO } from '@/lib/disc';
import type { Database, Escolaridade, Modalidade, Periodo } from '@/types/database';

type Vaga = Database['public']['Tables']['vagas']['Row'];

const eixo = z
  .string()
  .regex(/^\d{1,3}$/, 'Use um número de 0 a 100')
  .refine((v) => Number(v) <= 100, 'Máximo 100');

const schema = z.object({
  titulo: z.string().min(3, 'Dê um título pra vaga'),
  descricao: z.string(),
  cidade: z.string().min(2, 'Informe a cidade'),
  modalidade: z.enum(['remoto', 'presencial', 'hibrido'], { message: 'Escolha a modalidade' }),
  periodo: z.enum(['integral', 'meio', 'flexivel'], { message: 'Escolha o período' }),
  escolaridade_min: z.enum(['fundamental', 'medio', 'tecnico', 'superior']).nullable(),
  d: eixo,
  i: eixo,
  s: eixo,
  c: eixo,
});
type Form = z.infer<typeof schema>;

export interface DadosVaga {
  titulo: string;
  descricao: string | null;
  cidade: string;
  modalidade: Modalidade;
  periodo: Periodo;
  escolaridade_min: Escolaridade | null;
  disc_target_d: number;
  disc_target_i: number;
  disc_target_s: number;
  disc_target_c: number;
}

const MODALIDADES = [
  { id: 'presencial', nome: 'Presencial' },
  { id: 'hibrido', nome: 'Híbrido' },
  { id: 'remoto', nome: 'Remoto' },
] as const;
const PERIODOS = [
  { id: 'integral', nome: 'Integral' },
  { id: 'meio', nome: 'Meio período' },
  { id: 'flexivel', nome: 'Flexível' },
] as const;
const ESCOLARIDADES = [
  { id: 'nenhuma', nome: 'Sem exigência' },
  { id: 'fundamental', nome: 'Fundamental' },
  { id: 'medio', nome: 'Médio' },
  { id: 'tecnico', nome: 'Técnico' },
  { id: 'superior', nome: 'Superior' },
] as const;

export function VagaForm({
  inicial,
  onSalvar,
  salvando,
  erro,
}: {
  inicial?: Vaga;
  onSalvar: (dados: DadosVaga) => void;
  salvando: boolean;
  erro: string | null;
}) {
  const [cargo, setCargo] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: inicial?.titulo ?? '',
      descricao: inicial?.descricao ?? '',
      cidade: inicial?.cidade ?? '',
      modalidade: inicial?.modalidade ?? ('' as Form['modalidade']),
      periodo: inicial?.periodo ?? ('' as Form['periodo']),
      escolaridade_min: inicial?.escolaridade_min ?? null,
      d: String(inicial?.disc_target_d ?? ALVO_NEUTRO.d),
      i: String(inicial?.disc_target_i ?? ALVO_NEUTRO.i),
      s: String(inicial?.disc_target_s ?? ALVO_NEUTRO.s),
      c: String(inicial?.disc_target_c ?? ALVO_NEUTRO.c),
    },
  });

  function aplicaCargo(id: string) {
    setCargo(id);
    const alvo = ALVOS_CARGO.find((a) => a.id === id)?.alvo ?? ALVO_NEUTRO;
    setValue('d', String(alvo.d));
    setValue('i', String(alvo.i));
    setValue('s', String(alvo.s));
    setValue('c', String(alvo.c));
  }

  const salvar = handleSubmit((f) => {
    onSalvar({
      titulo: f.titulo,
      descricao: f.descricao.trim() === '' ? null : f.descricao,
      cidade: f.cidade,
      modalidade: f.modalidade,
      periodo: f.periodo,
      escolaridade_min: f.escolaridade_min,
      disc_target_d: Number(f.d),
      disc_target_i: Number(f.i),
      disc_target_s: Number(f.s),
      disc_target_c: Number(f.c),
    });
  });

  return (
    <View>
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      <Controller
        control={control}
        name="titulo"
        render={({ field: { onChange, value } }) => (
          <Campo rotulo="Título da vaga" value={value} onChangeText={onChange} erro={errors.titulo?.message} placeholder="Ex.: Atendente de loja" />
        )}
      />
      <Controller
        control={control}
        name="descricao"
        render={({ field: { onChange, value } }) => (
          <Campo rotulo="Descrição (opcional)" value={value} onChangeText={onChange} multiline numberOfLines={3} />
        )}
      />
      <Controller
        control={control}
        name="cidade"
        render={({ field: { onChange, value } }) => (
          <Campo rotulo="Cidade" value={value} onChangeText={onChange} erro={errors.cidade?.message} />
        )}
      />
      <Controller
        control={control}
        name="modalidade"
        render={({ field: { onChange, value } }) => (
          <Selecao rotulo="Modalidade" opcoes={MODALIDADES} valor={value || null} onChange={onChange} erro={errors.modalidade?.message} />
        )}
      />
      <Controller
        control={control}
        name="periodo"
        render={({ field: { onChange, value } }) => (
          <Selecao rotulo="Período" opcoes={PERIODOS} valor={value || null} onChange={onChange} erro={errors.periodo?.message} />
        )}
      />
      <Controller
        control={control}
        name="escolaridade_min"
        render={({ field: { onChange, value } }) => (
          <Selecao
            rotulo="Escolaridade mínima (opcional)"
            opcoes={ESCOLARIDADES}
            valor={value ?? 'nenhuma'}
            onChange={(v) => onChange(v === 'nenhuma' ? null : v)}
          />
        )}
      />

      <Text className="mb-1 font-medium text-gray-700">Perfil ideal (DISC)</Text>
      <Text className="mb-2 text-sm text-gray-500">
        Escolha o tipo de cargo pra preencher a sugestão — ajuste os números se quiser.
      </Text>
      <Selecao
        rotulo="Tipo de cargo"
        opcoes={ALVOS_CARGO.map((a) => ({ id: a.id, nome: a.nome }))}
        valor={cargo}
        onChange={aplicaCargo}
      />
      <View className="mb-2 flex-row gap-3">
        {(['d', 'i', 's', 'c'] as const).map((e) => (
          <View key={e} className="flex-1">
            <Controller
              control={control}
              name={e}
              render={({ field: { onChange, value } }) => (
                <Campo
                  rotulo={e.toUpperCase()}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  erro={errors[e]?.message}
                />
              )}
            />
          </View>
        ))}
      </View>

      <Botao titulo={inicial ? 'Salvar alterações' : 'Criar vaga'} onPress={salvar} carregando={salvando} />
    </View>
  );
}
