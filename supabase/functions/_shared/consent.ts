// Termo de consentimento LGPD do quiz — versionado (SECURITY.md §5).
// Compartilhado: o app exibe, a Edge Function valida a versão recebida.
// Mudou o texto => sobe a versão. Versões antigas ficam no histórico do git.

export const CONSENT_VERSAO = '2026-07-06.v1';

export const CONSENT_TEXTO =
  'Autorizo o uso dos meus dados (nome, telefone/WhatsApp, cidade e, se eu preencher, idade e ' +
  'escolaridade) e das minhas respostas deste quiz para análise de compatibilidade comportamental ' +
  'com ESTA vaga, pela empresa que a publicou. Meus dados não são vendidos nem usados pra outra ' +
  'finalidade. Candidaturas paradas há 12 meses são apagadas. Posso pedir a exclusão ou uma cópia ' +
  'dos meus dados a qualquer momento na página "Meus dados" (link no rodapé).';

export const CONSENT_POOL_TEXTO =
  '(Opcional) Aceito que, no futuro, meu perfil comportamental também possa ser mostrado a outras ' +
  'empresas que contratam pela plataforma.';
