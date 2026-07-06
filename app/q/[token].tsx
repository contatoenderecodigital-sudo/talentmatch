import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { z } from 'zod';
import {
  Alerta,
  Botao,
  Campo,
  Carregando,
  LinkTexto,
  Screen,
  Selecao,
  Subtitulo,
  Titulo,
} from '@/components/ui';
import { QUIZ, type RespostaQuiz } from '@/lib/disc';
import { traduzErroQuiz } from '@/lib/erros';
import { supabase } from '@/lib/supabase';
import {
  CONSENT_POOL_TEXTO,
  CONSENT_TEXTO,
  CONSENT_VERSAO,
} from '@/supabase/functions/_shared/consent';
import { normalizaTelefone } from '@/supabase/functions/_shared/scoring';

const dadosSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome'),
  telefone: z
    .string()
    .refine((v) => normalizaTelefone(v) !== null, 'Use DDD + número (ex.: 49 99999-9999)'),
  cidade: z.string().min(2, 'Informe sua cidade'),
  idade: z
    .string()
    .refine((v) => v === '' || (/^\d{2}$/.test(v) && Number(v) >= 14), 'Idade entre 14 e 99')
    .optional(),
  escolaridade: z.enum(['fundamental', 'medio', 'tecnico', 'superior']).nullable(),
});
type DadosForm = z.infer<typeof dadosSchema>;

const ESCOLARIDADES = [
  { id: 'fundamental', nome: 'Fundamental' },
  { id: 'medio', nome: 'Médio' },
  { id: 'tecnico', nome: 'Técnico' },
  { id: 'superior', nome: 'Superior' },
] as const;

type Etapa = 'inicio' | 'dados' | 'quiz' | 'fim';

function embaralha<T>(itens: T[]): T[] {
  const arr = [...itens];
  for (let k = arr.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [arr[k], arr[j]] = [arr[j]!, arr[k]!];
  }
  return arr;
}

function Rodape() {
  return (
    <View className="mt-8">
      <LinkTexto titulo="Política de privacidade" onPress={() => router.push('/privacidade')} />
      <LinkTexto titulo="Meus dados (excluir / exportar)" onPress={() => router.push('/meus-dados')} />
    </View>
  );
}

export default function QuizPublico() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [etapa, setEtapa] = useState<Etapa>('inicio');
  const [consent, setConsent] = useState(false);
  const [consentPool, setConsentPool] = useState(false);
  const [dados, setDados] = useState<DadosForm | null>(null);
  const [respostas, setRespostas] = useState<RespostaQuiz[]>([]);
  const [indice, setIndice] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const perguntas = useMemo(
    () => QUIZ.perguntas.map((p) => ({ ...p, opcoes: embaralha(p.opcoes) })),
    []
  );

  const vaga = useQuery({
    queryKey: ['vaga-publica', token],
    enabled: !!token,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_vaga_publica', { p_token: token! });
      if (error) throw error;
      return data[0] ?? null;
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DadosForm>({
    resolver: zodResolver(dadosSchema),
    defaultValues: { nome: '', telefone: '', cidade: '', idade: '', escolaridade: null },
  });

  if (vaga.isLoading) return <Carregando />;

  if (!vaga.data) {
    return (
      <Screen>
        <Titulo>Link indisponível</Titulo>
        <Alerta tipo="info">
          Esta vaga não está mais recebendo candidaturas. Fale com a empresa que divulgou o link.
        </Alerta>
        <Rodape />
      </Screen>
    );
  }
  const v = vaga.data;

  async function enviar(todas: RespostaQuiz[]) {
    setEnviando(true);
    setErro(null);
    const { error } = await supabase.functions.invoke('submit-quiz', {
      body: {
        token,
        nome: dados!.nome,
        telefone: dados!.telefone,
        cidade: dados!.cidade,
        idade: dados!.idade === '' || dados!.idade === undefined ? null : Number(dados!.idade),
        escolaridade: dados!.escolaridade,
        respostas: todas,
        consent: true,
        consent_pool: consentPool,
        consent_versao: CONSENT_VERSAO,
      },
    });
    setEnviando(false);
    if (error) {
      let codigo = 'desconhecido';
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === 'function') {
        try {
          codigo = ((await ctx.json()) as { erro?: string }).erro ?? codigo;
        } catch {
          // corpo não-JSON: mantém o código genérico
        }
      }
      setErro(traduzErroQuiz(codigo));
      setEtapa('quiz');
      return;
    }
    setEtapa('fim');
  }

  function responder(opcaoId: string) {
    const pergunta = perguntas[indice]!;
    const novas = [...respostas, { pergunta_id: pergunta.id, opcao_id: opcaoId }];
    setRespostas(novas);
    if (indice + 1 < perguntas.length) {
      setIndice(indice + 1);
    } else {
      void enviar(novas);
    }
  }

  if (etapa === 'inicio') {
    return (
      <Screen>
        <Titulo>{v.titulo}</Titulo>
        <Subtitulo>
          {v.empresa_nome} · {v.cidade} · {v.modalidade} · {v.periodo}
        </Subtitulo>
        {v.descricao ? <Text className="mb-4 text-gray-700">{v.descricao}</Text> : null}
        <Alerta tipo="info">
          Responda um quiz rápido (3–4 minutos) e sua candidatura vai direto pra empresa. Sem
          cadastro, sem baixar nada.
        </Alerta>

        <Pressable
          accessibilityRole="checkbox"
          onPress={() => setConsent(!consent)}
          className="mb-3 flex-row items-start gap-2 rounded-lg border border-gray-200 p-3">
          <Text className="text-lg">{consent ? '☑' : '☐'}</Text>
          <Text className="flex-1 text-sm text-gray-700">{CONSENT_TEXTO}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="checkbox"
          onPress={() => setConsentPool(!consentPool)}
          className="mb-4 flex-row items-start gap-2 rounded-lg border border-gray-200 p-3">
          <Text className="text-lg">{consentPool ? '☑' : '☐'}</Text>
          <Text className="flex-1 text-sm text-gray-500">{CONSENT_POOL_TEXTO}</Text>
        </Pressable>

        <Botao titulo="Começar" onPress={() => setEtapa('dados')} desabilitado={!consent} />
        {!consent ? (
          <Text className="text-center text-xs text-gray-400">
            Aceite o termo acima pra continuar.
          </Text>
        ) : null}
        <Rodape />
      </Screen>
    );
  }

  if (etapa === 'dados') {
    const continuar = handleSubmit((f) => {
      setDados(f);
      setEtapa('quiz');
    });
    return (
      <Screen>
        <Titulo>Seus dados</Titulo>
        <Subtitulo>A empresa só vê seu telefone se quiser te entrevistar</Subtitulo>
        <Controller
          control={control}
          name="nome"
          render={({ field: { onChange, value } }) => (
            <Campo rotulo="Nome" value={value} onChangeText={onChange} erro={errors.nome?.message} />
          )}
        />
        <Controller
          control={control}
          name="telefone"
          render={({ field: { onChange, value } }) => (
            <Campo
              rotulo="Telefone / WhatsApp"
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
              placeholder="49 99999-9999"
              erro={errors.telefone?.message}
            />
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
          name="idade"
          render={({ field: { onChange, value } }) => (
            <Campo
              rotulo="Idade (opcional)"
              value={value ?? ''}
              onChangeText={onChange}
              keyboardType="number-pad"
              erro={errors.idade?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="escolaridade"
          render={({ field: { onChange, value } }) => (
            <Selecao
              rotulo="Escolaridade (opcional)"
              opcoes={ESCOLARIDADES}
              valor={value}
              onChange={(e) => onChange(value === e ? null : e)}
            />
          )}
        />
        <Botao titulo="Ir pro quiz" onPress={continuar} />
      </Screen>
    );
  }

  if (etapa === 'quiz') {
    const pergunta = perguntas[indice]!;
    if (enviando) return <Carregando />;
    return (
      <Screen>
        <Text className="mb-2 text-sm text-gray-500">
          Pergunta {indice + 1} de {perguntas.length}
        </Text>
        <View className="mb-4 h-2 rounded-full bg-gray-100">
          <View
            className="h-2 rounded-full bg-primaria"
            style={{ width: `${Math.round((indice / perguntas.length) * 100)}%` }}
          />
        </View>
        {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
        <Titulo>{pergunta.texto}</Titulo>
        <View className="mt-4">
          {pergunta.opcoes.map((o) => (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              onPress={() => responder(o.id)}
              className="mb-3 rounded-xl border border-gray-200 bg-white p-4 active:border-primaria">
              <Text className="text-base text-gray-800">{o.texto}</Text>
            </Pressable>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Titulo>Candidatura enviada! 🎉</Titulo>
      <Alerta tipo="sucesso">
        Pronto, {dados?.nome.split(' ')[0]}! Suas respostas foram enviadas pra {v.empresa_nome}. Se
        o seu perfil combinar com a vaga, eles chamam você pelo WhatsApp.
      </Alerta>
      <Text className="text-gray-600">Pode fechar esta página.</Text>
      <Rodape />
    </Screen>
  );
}
