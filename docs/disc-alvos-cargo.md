# Alvos DISC sugeridos por tipo de cargo

> Pré-preenchem os sliders na criação da vaga (a empresa pode ajustar). Escala compatível com o
> quiz: **cada perfil é uma distribuição que soma ~100, com máximo prático de 75 por eixo**
> (ver `disc-quiz.json` §formula). Não usar alvos tipo [80,80,20,20] — são inatingíveis e
> achatam o score de todo mundo.
>
> **STATUS: A VALIDAR PELO DONO** (pendência da seção 10 do CONCEITO-v2). Valores de partida
> propostos na Fase 1 com base no senso comum de cada função; calibrar com dados reais depois.

| Tipo de cargo | D | I | S | C | Racional em uma linha |
|---|---|---|---|---|---|
| Atendimento / vendas de loja | 15 | 40 | 30 | 15 | Gente o dia todo: comunicação na frente, paciência atrás |
| Balcão / food (atendente) | 15 | 35 | 35 | 15 | Simpatia + aguentar pico e rotina |
| Caixa | 10 | 20 | 35 | 35 | Precisão e constância valem mais que lábia |
| Estoque / reposição | 15 | 10 | 45 | 30 | Rotina física constante, organização |
| Produção / cozinha | 15 | 10 | 40 | 35 | Repetição com padrão e cuidado |
| Entregador | 25 | 15 | 40 | 20 | Autonomia na rua + constância |
| Recepção / SAC / telefone | 10 | 35 | 35 | 20 | Escuta e comunicação calma |
| Serviços gerais / limpeza | 10 | 10 | 50 | 30 | Rotina estável, capricho |
| Líder de turno / gerente de loja | 35 | 30 | 20 | 15 | Decide, cobra e comunica |
| Telemarketing / vendas ativas | 25 | 40 | 20 | 15 | Insistência + conversa |

## Como usar

- Na tela de criar vaga (E5 do PRD), o campo "tipo de cargo" seleciona a linha e pré-preenche os
  4 sliders; a empresa ajusta se quiser. Vaga sem tipo mapeado: default neutro [20, 30, 30, 20].
- Esta tabela vira constante em `lib/disc.ts` (ou JSON próprio) lida daqui — fonte única.
- Quando houver dados reais (candidatos contratados que ficaram ≥3 meses), recalibrar e versionar.
