# Decisões tomadas com autonomia (revisão em lote pelo dono)

> Registro das decisões que o Claude Code toma sozinho (regra 9 do CLAUDE.md) e de decisões
> provisórias do dono que precisam de revisão futura. Uma linha por decisão: o que foi escolhido
> e por quê. O dono revisa em lote, não uma a uma.

| Data | Decisão | Por quê / revisão |
|---|---|---|
| 2026-07-05 | **Nome oficial: "DeuVaga" (decisão do dono — substitui o provisório TalentMatch).** Usado no nome de exibição do app, slug/scheme, bundle id/package `com.deuvaga.app` e pasta do repo (`C:\dev\deuvaga`). | Verificado pelo dono em 05/07/2026: busca no INPI sem resultados; domínios .com e .ai disponíveis. **Sem pendência de revisão** — o alerta anterior (risco de marca com "Match") caducou com a troca do nome. |
| 2026-07-06 | Paleta: verde `#059669` (emerald) como cor primária; componentes próprios minimalistas (`components/ui.tsx`) sobre nativewind. | Verde remete a "deu certo/vaga aberta"; kit enxuto evita dependência de UI pesada. |
| 2026-07-06 | Tela inicial de quem não está logado é o login (com links pra cadastro e recuperação). | Padrão de app B2B; candidato nunca precisa dessa porta (entra pelo link). |
| 2026-07-06 | Alvo DISC na criação de vaga: 4 campos numéricos 0–100 pré-preenchidos pela sugestão por cargo — sem sliders. | Slider multiplataforma exigiria dependência extra e é impreciso no web; número direto é mais confiável. |
| 2026-07-06 | Campos de opção fechada (modalidade, período, escolaridade, cargo) viram chips clicáveis, não dropdown. | Menos toques no mobile, funciona igual no web, zero dependência. |
| 2026-07-06 | Deck: um card por vez, ordenado por score, com botões "Quero entrevistar" / "Pular" / "Descartar" — sem gesto de arrastar no MVP. | Botões são acessíveis e confiáveis no navegador; o gesto de swipe é polish futuro, o valor está no ranking (CONCEITO-v2 §5). |
| 2026-07-06 | Opções do quiz são embaralhadas na exibição (a ordem D/I/S/C fixa do JSON criaria vício de posição). | Registrado também em docs/disc-quiz.json (instrucoes_app). |
| 2026-07-06 | Candidato NÃO vê o próprio score/perfil na confirmação do quiz. | Evita frustração e gaming; o resultado é insumo da empresa. Reavaliar na Etapa 2. |
| 2026-07-06 | Descarte é reversível: seção "Descartados" no funil com botão "Restaurar" (volta pra 'visto'). | Arrependimento é comum na triagem rápida; reversão barata evita perder candidato bom. |
| 2026-07-06 | Página "Meus dados" responde de forma neutra (não confirma se o telefone existe) e informa prazo de 7 dias úteis. | Evita enumeração de telefones cadastrados; prazo operacional razoável pro MVP. |
| 2026-07-06 | Erros do envio do quiz (já respondeu, link inativo, rate limit) aparecem como mensagem amigável na própria tela do quiz. | Candidato leigo não pode ver código de erro técnico. Mapa em lib/erros.ts. |
