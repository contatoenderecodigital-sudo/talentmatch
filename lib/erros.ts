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

// Erros de regra de negócio vindos do banco (triggers/RPCs da Fase 3).
export function traduzErroBanco(mensagem: string): string {
  if (mensagem.includes('plano inativo')) return 'Escolha um plano antes de abrir a vaga.';
  if (mensagem.includes('limite de vagas'))
    return 'Você atingiu o limite de vagas abertas do seu plano. Feche uma vaga ou mude de plano.';
  if (mensagem.includes('contato indisponivel'))
    return 'Marque "quero entrevistar" antes de ver o contato.';
  if (mensagem.includes('duplicate key') && mensagem.includes('cnpj'))
    return 'Já existe uma empresa cadastrada com esse CNPJ.';
  return `Algo deu errado: ${mensagem}`;
}

// Códigos de erro da Edge Function submit-quiz → mensagem pro candidato.
export function traduzErroQuiz(codigo: string): string {
  const mapa: Record<string, string> = {
    link_inativo: 'Esta vaga não está mais recebendo candidaturas.',
    ja_respondeu: 'Você já respondeu o quiz desta vaga com esse telefone. A empresa já tem a sua candidatura!',
    muitos_envios: 'Muitos envios em pouco tempo. Aguarde uma hora e tente de novo.',
    telefone_invalido: 'Confira o telefone: use DDD + número (ex.: 49 99999-9999).',
    termo_desatualizado: 'O termo de consentimento foi atualizado. Recarregue a página e tente de novo.',
    consentimento_obrigatorio: 'É preciso aceitar o termo de consentimento pra se candidatar.',
  };
  return mapa[codigo] ?? 'Não foi possível enviar sua candidatura. Tente de novo em instantes.';
}
