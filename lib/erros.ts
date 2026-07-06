// Tradução das mensagens de erro do Supabase Auth pro usuário final.
const MAPA: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos.',
  'Email not confirmed': 'Confirme seu email antes de entrar (veja sua caixa de entrada).',
  'User already registered': 'Já existe uma conta com esse email.',
  'Password should be at least 6 characters.': 'A senha precisa ter no mínimo 6 caracteres.',
  'For security purposes, you can only request this once every 60 seconds':
    'Aguarde 60 segundos antes de pedir de novo.',
};

export function traduzErroAuth(mensagem: string): string {
  return MAPA[mensagem] ?? `Algo deu errado: ${mensagem}`;
}
