import { Ionicons } from '@expo/vector-icons';
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

/** Tela base: fundo com leve gradiente teal + conteúdo centralizado.
 *  `rodape` fica fixo no rodapé (CTA), `flutuante` sobrepõe (ex.: FAB). */
export function Screen({
  children,
  rodape,
  flutuante,
  semPad = false,
}: {
  children: ReactNode;
  rodape?: ReactNode;
  flutuante?: ReactNode;
  semPad?: boolean;
}) {
  return (
    <View className="flex-1">
      <LinearGradient colors={GRAD_FUNDO} style={StyleSheet.absoluteFill} />
      <ScrollView
        className="flex-1"
        contentContainerClassName={`w-full max-w-xl self-center ${semPad ? '' : 'px-5 pt-5'} ${rodape ? 'pb-40' : 'pb-28'}`}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {flutuante}
      {rodape ? (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-marca-100 bg-white/95 px-5 pb-8 pt-3"
          style={SOMBRA}>
          <View className="mx-auto w-full max-w-xl">{rodape}</View>
        </View>
      ) : null}
    </View>
  );
}

/** Cabeçalho com gradiente de marca — dá o toque premium no topo das telas. */
export function Cabecalho({
  titulo,
  subtitulo,
  escuro = false,
  aoVoltar,
  direita,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  escuro?: boolean;
  aoVoltar?: () => void;
  direita?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <LinearGradient
      colors={escuro ? GRAD_ESCURO : GRAD_MARCA}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: 26, padding: 22, marginBottom: 18 }, SOMBRA]}>
      {(aoVoltar || direita) && (
        <View className="mb-3 flex-row items-center justify-between">
          {aoVoltar ? (
            <Pressable onPress={aoVoltar} className="h-9 w-9 items-center justify-center rounded-full bg-white/20" accessibilityRole="button">
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>
          ) : (
            <View className="h-9 w-9" />
          )}
          {direita ?? null}
        </View>
      )}
      <Text className="text-[27px] font-extrabold leading-tight text-white">{titulo}</Text>
      {subtitulo ? <Text className="mt-1 text-[15px] text-white/85">{subtitulo}</Text> : null}
      {children}
    </LinearGradient>
  );
}

/** Botão de ação flutuante (FAB) — canto inferior direito, acima da barra de abas. */
export function FAB({ titulo, onPress, icone = 'add' }: { titulo?: string; onPress: () => void; icone?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View className="absolute right-5" style={[{ bottom: 96 }, SOMBRA]}>
      <Pressable accessibilityRole="button" onPress={onPress} className="overflow-hidden rounded-full">
        <LinearGradient
          colors={GRAD_MARCA}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 15, paddingHorizontal: titulo ? 20 : 15 }}>
          <Ionicons name={icone} size={22} color="#fff" />
          {titulo ? <Text className="text-base font-bold text-white">{titulo}</Text> : null}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

/** Botão de ação circular (dock do deck). */
export function BotaoCircular({
  icone,
  onPress,
  variante = 'neutro',
  grande = false,
  desabilitado,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variante?: 'neutro' | 'sim' | 'nao';
  grande?: boolean;
  desabilitado?: boolean;
}) {
  const tam = grande ? 72 : 58;
  const cor = variante === 'sim' ? COR.marca : variante === 'nao' ? '#e5484d' : '#33514f';
  const conteudo = (
    <View
      style={[
        { width: tam, height: tam, borderRadius: tam / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', opacity: desabilitado ? 0.4 : 1 },
        SOMBRA,
      ]}>
      <Ionicons name={icone} size={grande ? 32 : 26} color={cor} />
    </View>
  );
  if (variante === 'sim') {
    return (
      <Pressable onPress={onPress} disabled={desabilitado} accessibilityRole="button" className="overflow-hidden rounded-full" style={[{ opacity: desabilitado ? 0.5 : 1 }, SOMBRA]}>
        <LinearGradient colors={GRAD_MARCA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: tam, height: tam, borderRadius: tam / 2, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icone} size={grande ? 32 : 26} color="#fff" />
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} disabled={desabilitado} accessibilityRole="button">
      {conteudo}
    </Pressable>
  );
}

/** Avatar circular com iniciais em gradiente. */
export function Avatar({ nome, tam = 52 }: { nome: string; tam?: number }) {
  const iniciais = nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
  return (
    <LinearGradient
      colors={GRAD_MARCA}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: tam, height: tam, borderRadius: tam / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: tam * 0.36 }}>{iniciais}</Text>
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
