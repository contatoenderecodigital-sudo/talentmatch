import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="w-full max-w-xl self-center p-6 pb-16"
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Titulo({ children }: { children: ReactNode }) {
  return <Text className="mb-1 text-2xl font-bold text-gray-900">{children}</Text>;
}

export function Subtitulo({ children }: { children: ReactNode }) {
  return <Text className="mb-6 text-base text-gray-500">{children}</Text>;
}

type CampoProps = TextInputProps & { rotulo: string; erro?: string };

export function Campo({ rotulo, erro, ...props }: CampoProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1 font-medium text-gray-700">{rotulo}</Text>
      <TextInput
        className={`rounded-lg border bg-white px-3 py-3 text-base text-gray-900 ${erro ? 'border-red-500' : 'border-gray-300'}`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {erro ? <Text className="mt-1 text-sm text-red-600">{erro}</Text> : null}
    </View>
  );
}

type BotaoProps = {
  titulo: string;
  onPress: () => void;
  carregando?: boolean;
  desabilitado?: boolean;
  variante?: 'primaria' | 'secundaria' | 'perigo';
};

export function Botao({ titulo, onPress, carregando, desabilitado, variante = 'primaria' }: BotaoProps) {
  const fundo = {
    primaria: 'bg-primaria',
    secundaria: 'bg-gray-100',
    perigo: 'bg-red-600',
  }[variante];
  const cor = variante === 'secundaria' ? 'text-gray-800' : 'text-white';
  const inativo = desabilitado || carregando;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inativo}
      className={`mb-3 items-center rounded-lg px-4 py-3 ${fundo} ${inativo ? 'opacity-50' : ''}`}>
      {carregando ? (
        <ActivityIndicator color={variante === 'secundaria' ? '#1f2937' : '#ffffff'} />
      ) : (
        <Text className={`text-base font-semibold ${cor}`}>{titulo}</Text>
      )}
    </Pressable>
  );
}

export function Alerta({ tipo, children }: { tipo: 'erro' | 'info' | 'sucesso'; children: ReactNode }) {
  const estilo = {
    erro: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    sucesso: 'bg-emerald-50 border-emerald-200',
  }[tipo];
  const corTexto = {
    erro: 'text-red-700',
    info: 'text-blue-700',
    sucesso: 'text-emerald-700',
  }[tipo];
  return (
    <View className={`mb-4 rounded-lg border p-3 ${estilo}`}>
      <Text className={`text-sm ${corTexto}`}>{children}</Text>
    </View>
  );
}

export function LinkTexto({ titulo, onPress }: { titulo: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} className="py-2">
      <Text className="text-center text-primaria">{titulo}</Text>
    </Pressable>
  );
}

export function Selecao<T extends string>({
  rotulo,
  opcoes,
  valor,
  onChange,
  erro,
}: {
  rotulo: string;
  opcoes: readonly { id: T; nome: string }[];
  valor: T | null;
  onChange: (v: T) => void;
  erro?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1 font-medium text-gray-700">{rotulo}</Text>
      <View className="flex-row flex-wrap gap-2">
        {opcoes.map((o) => (
          <Pressable
            key={o.id}
            accessibilityRole="button"
            onPress={() => onChange(o.id)}
            className={`rounded-full border px-3 py-2 ${valor === o.id ? 'border-primaria bg-emerald-50' : 'border-gray-300 bg-white'}`}>
            <Text className={valor === o.id ? 'font-medium text-primaria' : 'text-gray-700'}>
              {o.nome}
            </Text>
          </Pressable>
        ))}
      </View>
      {erro ? <Text className="mt-1 text-sm text-red-600">{erro}</Text> : null}
    </View>
  );
}

export function Chip({ texto, tom }: { texto: string; tom: 'verde' | 'cinza' | 'vermelho' | 'azul' }) {
  const cores = {
    verde: 'bg-emerald-100 text-emerald-800',
    cinza: 'bg-gray-100 text-gray-600',
    vermelho: 'bg-red-100 text-red-700',
    azul: 'bg-blue-100 text-blue-700',
  }[tom];
  return (
    <View className={`self-start rounded-full px-2 py-0.5 ${cores.split(' ')[0]}`}>
      <Text className={`text-xs font-medium ${cores.split(' ')[1]}`}>{texto}</Text>
    </View>
  );
}

export function Carregando() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#059669" />
    </View>
  );
}
