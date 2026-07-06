import * as Linking from 'expo-linking';

/** URL pública do quiz de uma vaga. Em produção, defina EXPO_PUBLIC_APP_URL no build web. */
export function quizUrl(token: string): string {
  const base = process.env.EXPO_PUBLIC_APP_URL ?? Linking.createURL('');
  return `${base.replace(/\/+$/, '')}/q/${token}`;
}
