import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Alerta, Botao, Screen, Subtitulo, Titulo } from '@/components/ui';
import { useEmpresa } from '@/hooks/useEmpresa';
import { billing, TIERS } from '@/lib/billing';
import type { PlanoTier } from '@/types/database';

export default function Plano() {
  const empresa = useEmpresa();
  const qc = useQueryClient();
  const [escolhido, setEscolhido] = useState<PlanoTier | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const atual = empresa.data?.plano_status === 'ativa' ? empresa.data.plano_tier : null;

  async function confirmar() {
    if (!escolhido) return;
    setSalvando(true);
    setErro(null);
    try {
      await billing.assinar(escolhido);
      await qc.invalidateQueries({ queryKey: ['empresa'] });
      router.replace('/(empresa)/vagas');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível ativar o plano.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen>
      <Titulo>Plano</Titulo>
      <Subtitulo>Sem cobrança durante a validação — os valores serão definidos depois.</Subtitulo>
      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {TIERS.map((t) => {
        const selecionado = (escolhido ?? atual) === t.id;
        return (
          <Pressable
            key={t.id}
            accessibilityRole="button"
            onPress={() => setEscolhido(t.id)}
            className={`mb-3 rounded-xl border p-4 ${selecionado ? 'border-primaria bg-emerald-50' : 'border-gray-200 bg-white'}`}>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">{t.nome}</Text>
              {atual === t.id ? <Text className="text-xs text-primaria">plano atual</Text> : null}
            </View>
            <Text className="text-gray-600">{t.descricao}</Text>
          </Pressable>
        );
      })}
      <Botao
        titulo="Ativar plano"
        onPress={confirmar}
        carregando={salvando}
        desabilitado={!escolhido || escolhido === atual}
      />
    </Screen>
  );
}
