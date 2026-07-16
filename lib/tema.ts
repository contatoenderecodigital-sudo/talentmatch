// Tokens visuais do DeuVaga — tema azul-esverdeado (teal) premium.
// Cores literais aqui porque LinearGradient e sombras não leem classes do tailwind.
import type { ColorValue } from 'react-native';

// Gradiente de marca: verde-azulado → azul. Usado em botões, cabeçalhos e destaques.
export const GRAD_MARCA: readonly [ColorValue, ColorValue, ...ColorValue[]] = [
  '#14b8a6',
  '#0d9488',
  '#0e7490',
];

// Gradiente escuro para cabeçalhos/telas de destaque (login, match, plano).
export const GRAD_ESCURO: readonly [ColorValue, ColorValue, ...ColorValue[]] = [
  '#0f766e',
  '#115e59',
  '#0b3b3a',
];

// Gradiente suave para fundo de tela (quase branco com leve tom teal).
export const GRAD_FUNDO: readonly [ColorValue, ColorValue, ...ColorValue[]] = [
  '#f5fdfb',
  '#eafaf6',
];

// Cores nomeadas (para props que não aceitam classe).
export const COR = {
  marca: '#0d9488',
  marcaEscura: '#0f766e',
  marcaClara: '#5eead4',
  oceano: '#0e7490',
  tinta: '#0b2b2a',
  cinzaTexto: '#5b6b6a',
  cinzaFraco: '#9db3b0',
  branco: '#ffffff',
} as const;

// Sombra premium reutilizável (funciona em iOS/Android/web).
export const SOMBRA = {
  shadowColor: '#0b3b3a',
  shadowOpacity: 0.12,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
} as const;

export const SOMBRA_SUAVE = {
  shadowColor: '#0b3b3a',
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;
