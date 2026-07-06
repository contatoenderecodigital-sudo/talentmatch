// Gera supabase/functions/_shared/quiz-data.ts a partir de docs/disc-quiz.json
// (fonte única — a Edge Function não lê JSON em runtime, importa o TS gerado).
// Rodar sempre que docs/disc-quiz.json mudar: node scripts/gen-quiz-data.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const quiz = JSON.parse(readFileSync(join(raiz, 'docs/disc-quiz.json'), 'utf8'));

const conteudo = `// GERADO por scripts/gen-quiz-data.mjs a partir de docs/disc-quiz.json — NAO editar na mao.
import type { QuizSchema } from './scoring.ts';

export const QUIZ_VERSAO = ${JSON.stringify(quiz.versao)};

export const QUIZ: QuizSchema = ${JSON.stringify({ perguntas: quiz.perguntas }, null, 2)};
`;

writeFileSync(join(raiz, 'supabase/functions/_shared/quiz-data.ts'), conteudo);
console.log('quiz-data.ts gerado:', quiz.perguntas.length, 'perguntas, versao', quiz.versao);
