import { router } from 'expo-router';
import { Text } from 'react-native';
import { LinkTexto, Screen, Subtitulo, Titulo } from '@/components/ui';
import { CONSENT_VERSAO } from '@/supabase/functions/_shared/consent';

// Política de privacidade (LGPD). RASCUNHO operacional do MVP — passar por revisão
// jurídica antes de escala (SECURITY.md §9).
const SECOES: { titulo: string; texto: string }[] = [
  {
    titulo: 'O que coletamos',
    texto:
      'De candidatos: nome, telefone/WhatsApp, cidade, idade e escolaridade (os dois últimos só se você preencher) e as respostas do quiz comportamental. De empresas: nome, CNPJ, cidade e email da conta. Não coletamos CPF, foto nem endereço.',
  },
  {
    titulo: 'Pra que usamos',
    texto:
      'As respostas do candidato viram um perfil comportamental (DISC) comparado com o perfil que a vaga pede. O resultado é mostrado SÓ pra empresa dona da vaga em que você se candidatou. Seu telefone só é revelado se a empresa marcar que quer te entrevistar — e esse acesso fica registrado.',
  },
  {
    titulo: 'Com quem compartilhamos',
    texto:
      'Com ninguém além da empresa da vaga. Seus dados não são vendidos. Se no futuro a plataforma permitir que outras empresas vejam seu perfil, isso só vale pra quem marcou o aceite opcional no quiz.',
  },
  {
    titulo: 'Por quanto tempo guardamos',
    texto:
      'Candidaturas sem movimentação há 12 meses são apagadas automaticamente, junto com os dados pessoais.',
  },
  {
    titulo: 'Seus direitos',
    texto:
      'Você pode pedir a exclusão definitiva ou uma cópia dos seus dados a qualquer momento, na página "Meus dados", informando o telefone usado na candidatura. A exclusão apaga seus dados de verdade.',
  },
  {
    titulo: 'Onde os dados ficam',
    texto:
      'Em banco de dados gerenciado (Supabase), com acesso restrito por regras de segurança em nível de linha e registro de auditoria de quem acessou o quê.',
  },
];

export default function Privacidade() {
  return (
    <Screen>
      <Titulo>Política de privacidade</Titulo>
      <Subtitulo>Versão do termo: {CONSENT_VERSAO}</Subtitulo>
      {SECOES.map((s) => (
        <Text key={s.titulo} className="mb-4 text-gray-700">
          <Text className="font-semibold text-gray-900">{s.titulo}. </Text>
          {s.texto}
        </Text>
      ))}
      <LinkTexto titulo="Meus dados (excluir / exportar)" onPress={() => router.push('/meus-dados')} />
      <LinkTexto titulo="← Voltar" onPress={() => router.back()} />
    </Screen>
  );
}
