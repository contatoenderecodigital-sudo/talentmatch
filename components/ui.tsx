import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { COR, GRAD_ESCURO, GRAD_FUNDO, GRAD_MARCA, SOMBRA, SOMBRA_SUAVE } from '@/lib/tema';

/** Tela base: fundo com leve gradiente teal + conteúdo centralizado. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1">
      <LinearGradient colors={GRAD_FUNDO} style={StyleSheet.absoluteFill} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="w-full max-w-xl self-center p-6 pb-24"
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
}

/** Cabeçalho com gradiente de marca — dá o toque premium no topo das telas. */
export function Cabecalho({
  titulo,
  subtitulo,
  escuro = false,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  escuro?: boolean;
  children?: ReactNode;
}) {
  return (
    <LinearGradient
      colors={escuro ? GRAD_ESCURO : GRAD_MARCA}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: 24, padding: 22, marginBottom: 20 }, SOMBRA]}>
      <Text className="text-2xl font-extrabold text-white">{titulo}</Text>
      {subtitulo ? <Text className="mt-1 text-[15px] text-white/85">{subtitulo}</Text> : null}
      {children}
    </LinearGradient>
  );
}

/** Cartão branco elevado. */
export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <View
      className={`mb-4 rounded-2xl border border-marca-100 bg-white p-5 ${className}`}
      style={SOMBRA_SUAVE}>
      {children}
    </View>
  );
}

export function Titulo({ children }: { children: ReactNode }) {
  return <Text className="mb-1 text-3xl font-extrabold tracking-tight text-tinta">{children}</Text>;
}

export function Subtitulo({ children }: { children: ReactNode }) {
  return <Text className="mb-6 text-base text-[#5b6b6a]">{children}</Text>;
}

type CampoProps = TextInputProps & { rotulo: string; erro?: string };

export function Campo({ rotulo, erro, ...props }: CampoProps) {
  const [focado, setFocado] = useState(false);
  const borda = erro ? 'border-red-400' : focado ? 'border-marca-500' : 'border-marca-100';
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-semibold text-[#33514f]">{rotulo}</Text>
      <TextInput
        className={`rounded-xl border-2 bg-white px-4 py-3.5 text-base text-tinta ${borda}`}
        placeholderTextColor="#9db3b0"
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        style={focado ? SOMBRA_SUAVE : undefined}
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
  const inativo = desabilitado || carregando;

  const conteudo = (cor: string) =>
    carregando ? (
      <ActivityIndicator color={cor} />
    ) : (
      <Text className="text-base font-bold" style={{ color: cor }}>
        {titulo}
      </Text>
    );

  if (variante === 'primaria') {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={inativo}
        className="mb-3 overflow-hidden rounded-xl"
        style={[{ opacity: inativo ? 0.5 : 1 }, SOMBRA]}>
        <LinearGradient
          colors={GRAD_MARCA}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16 }}>
          {conteudo(COR.branco)}
        </LinearGradient>
      </Pressable>
    );
  }

  const fundo = variante === 'perigo' ? 'bg-red-600' : 'bg-marca-50 border border-marca-200';
  const cor = variante === 'perigo' ? COR.branco : COR.marcaEscura;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inativo}
      className={`mb-3 items-center rounded-xl px-4 py-3.5 ${fundo} ${inativo ? 'opacity-50' : ''}`}>
      {conteudo(cor)}
    </Pressable>
  );
}

export function Alerta({ tipo, children }: { tipo: 'erro' | 'info' | 'sucesso'; children: ReactNode }) {
  const estilo = {
    erro: 'bg-red-50 border-red-200',
    info: 'bg-marca-50 border-marca-200',
    sucesso: 'bg-emerald-50 border-emerald-200',
  }[tipo];
  const corTexto = {
    erro: 'text-red-700',
    info: 'text-primaria-escura',
    sucesso: 'text-emerald-700',
  }[tipo];
  return (
    <View className={`mb-4 rounded-xl border p-3.5 ${estilo}`}>
      <Text className={`text-sm ${corTexto}`}>{children}</Text>
    </View>
  );
}

export function LinkTexto({ titulo, onPress }: { titulo: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} className="py-2.5">
      <Text className="text-center font-semibold text-primaria">{titulo}</Text>
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
      <Text className="mb-1.5 text-sm font-semibold text-[#33514f]">{rotulo}</Text>
      <View className="flex-row flex-wrap gap-2">
        {opcoes.map((o) => {
          const ativo = valor === o.id;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              onPress={() => onChange(o.id)}
              className={`rounded-full border-2 px-4 py-2 ${ativo ? 'border-marca-500 bg-marca-50' : 'border-marca-100 bg-white'}`}>
              <Text className={ativo ? 'font-bold text-primaria-escura' : 'text-[#5b6b6a]'}>
                {o.nome}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {erro ? <Text className="mt-1 text-sm text-red-600">{erro}</Text> : null}
    </View>
  );
}

export function Chip({ texto, tom }: { texto: string; tom: 'verde' | 'cinza' | 'vermelho' | 'azul' }) {
  const cores = {
    verde: 'bg-marca-100 text-primaria-escura',
    cinza: 'bg-gray-100 text-gray-600',
    vermelho: 'bg-red-100 text-red-700',
    azul: 'bg-oceano-400/20 text-oceano-700',
  }[tom];
  const [bg, txt] = cores.split(' ');
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${bg}`}>
      <Text className={`text-xs font-bold ${txt}`}>{texto}</Text>
    </View>
  );
}

/** Selo de % de fit com gradiente — usado no deck/cards. */
export function SeloScore({ valor }: { valor: number }) {
  return (
    <LinearGradient
      colors={GRAD_MARCA}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' }, SOMBRA_SUAVE]}>
      <Text className="text-2xl font-extrabold text-white">{valor}%</Text>
      <Text className="text-[10px] font-semibold uppercase tracking-wide text-white/85">de fit</Text>
    </LinearGradient>
  );
}

/** Barra de um eixo DISC. */
export function BarraDisc({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <View className="mb-1.5 flex-row items-center gap-2">
      <Text className="w-4 text-xs font-bold text-[#33514f]">{rotulo}</Text>
      <View className="h-2.5 flex-1 overflow-hidden rounded-full bg-marca-50">
        <LinearGradient
          colors={GRAD_MARCA}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: '100%', width: `${Math.min(valor, 100)}%`, borderRadius: 999 }}
        />
      </View>
      <Text className="w-8 text-right text-xs font-medium text-[#5b6b6a]">{valor}</Text>
    </View>
  );
}

export function Carregando() {
  return (
    <View className="flex-1 items-center justify-center">
      <LinearGradient colors={GRAD_FUNDO} style={StyleSheet.absoluteFill} />
      <ActivityIndicator size="large" color={COR.marca} />
    </View>
  );
}
