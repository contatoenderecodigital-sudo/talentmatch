# Conceito v2 — Triagem Comportamental pra Contratação (ex-TalentMatch)

> Versão reformulada da ideia. Substitui o enquadramento de "marketplace de swipe" do pitch antigo.
> Nome, logo e código são novos: nada do material do campeonato é reaproveitado.

---

## 1. Uma frase

App que analisa o perfil comportamental dos candidatos que a empresa **já tem** e diz quais têm o
encaixe certo pra vaga, reduzindo contratação errada em cargos de alta rotatividade.

Não é "acha gente do nada". É "acerta na hora de escolher quem já apareceu".

---

## 2. O que mudou do pitch original, e por quê

| Pitch antigo | v2 | Motivo |
|---|---|---|
| Marketplace dois-lados (empresa e candidato dão swipe) | Ferramenta de triagem pra empresa | Marketplace morre no cold-start. Ferramenta tem valor com 1 cliente e 0 candidatos no pool |
| Precisa de multidão de candidatos cadastrados pra funcionar | Empresa usa os candidatos que ela mesma trouxe | Valor no dia 1, sem depender de encher dois lados |
| "IA de match" (vago) | Score DISC determinístico + leitura simples | Honesto, buildável, explicável pro cliente |
| Vende pra "qualquer empresa" | Foco em operacional de alta rotatividade | Onde a dor é maior, o volume é maior e não tem RH estruturado |
| Swipe é o produto | Swipe é só a UX de navegar/descartar | O valor é o fit, não o gesto |

O destino continua sendo virar marketplace. Muda o **caminho**: primeiro ferramenta, marketplace
quando o pool de candidatos já tiver enchido sozinho (ver seção 6).

---

## 3. A dor que resolve (o que faz a empresa pagar)

Em cargo operacional (varejo, atendimento, produção, food), a rotatividade é alta e cara.
Cada contratação errada custa: rescisão, novo processo seletivo, novo treinamento, queda de
produtividade enquanto a vaga fica aberta, e sobrecarga de quem fica. E o gestor dessas empresas
normalmente **não tem RH** pra fazer análise comportamental. Ele contrata "no feeling" e erra.

O app faz, de forma simples e barata, o que só consultoria de RH cara faz hoje: dizer se a pessoa
tem o perfil comportamental que aquela função exige, antes de contratar.

> Ação: levantar com 3 a 5 donos de comércio da região o custo real que eles estimam pra uma
> contratação que não deu certo. Esse número vira o argumento central de venda. Não inventar, coletar.

---

## 4. Como funciona, na prática (fluxo da empresa)

1. **Cria a vaga** e define o perfil comportamental ideal. O app sugere um alvo DISC padrão por
   tipo de cargo (ex: atendimento = alto I e S), a empresa ajusta se quiser.
2. **Gera um link (e QR code) do quiz** pra mandar pros candidatos que ela já tem: os que responderam
   a vaga no Instagram, no grupo de WhatsApp, o mural da loja, indicação.
3. **Candidato responde o quiz** em 3 a 4 minutos pelo link, no navegador, sem baixar app e sem criar
   conta pesada. Só o consentimento LGPD e os dados mínimos.
4. **App mostra o ranking de fit** dos candidatos daquela vaga: % de compatibilidade e uma leitura em
   linguagem simples ("comunicativo, bom pra atendimento", "estável, aguenta função repetitiva").
5. **Empresa entrevista e contrata** os mais alinhados. O swipe entra aqui, só como jeito rápido de
   revisar e descartar candidato dentro da lista dela.

Ponto central: isso funciona com **uma empresa e zero candidatos** pré-existentes no sistema. Sem
cold-start.

---

## 5. Diferencial contra os concorrentes

LinkedIn, Indeed, Catho, SINE: todos são **mural de vaga**. O valor deles é volume de currículo.
Você não compete nisso e nem deve tentar.

Seu eixo é **fit comportamental + redução de turnover**. Você não entrega "mais candidatos", entrega
"o candidato certo pra não perder gente em 3 meses". É outra prateleira. Quem compra currículo vai no
Indeed. Quem quer parar de errar contratação vai em você.

Toda a comunicação (site, pitch, app) se apoia nisso. O swipe é enfeite, não é o argumento.

---

## 6. O caminho ferramenta → marketplace (o pulo do gato)

- **Etapa 1 (MVP, agora):** ferramenta de triagem. Cada empresa traz os próprios candidatos pra
  responder o quiz. Você entrega valor imediato e, de graça, o teu lado "candidato" vai enchendo:
  todo candidato que responde fica no sistema.
- **Etapa 2 (quando o pool encher):** com candidatos suficientes acumulados numa cidade/segmento,
  liga o modo marketplace por cima. Agora a empresa também pode **buscar ativamente** no pool, e o
  candidato passa a **ver vagas** de outras empresas. Os dois lados já estão cheios, então o
  marketplace não nasce vazio.
- **Etapa 3:** replica cidade por cidade, segmento por segmento.

Você chega no destino do pitch original, mas por um caminho que não morre no começo.

---

## 7. Modelo de negócio (revisado)

Continua assinatura B2B, mas a unidade muda de "número de vagas" pra algo mais alinhado ao uso da
ferramenta. Sugestão de partida (validar com cliente real, não casar com número ainda):

- **Básico:** poucas vagas ativas / X candidatos analisados por mês.
- **Intermediário:** mais vagas ativas / mais análises.
- **Alto volume:** ilimitado ou pacote grande, pra quem contrata muito.

Cobrança recorrente via gateway a definir (interface de billing desacoplada — ver CLAUDE.md
seção 2). NF-e de serviço por ciclo (ver SECURITY.md, seção 7).

Lembrete honesto que refaz a conta do pitch: o app **não custa R$200 mil**. Você constrói o MVP com o
Claude Code pelo custo da tua assinatura. A conta de "quitar em 1 ano" some, a margem é quase cheia
desde o primeiro cliente. Refazer esse slide antes de mostrar pra qualquer investidor.

---

## 8. Go-to-market (aproveitando o que você já tem)

- Você já vendeu 10+ assinaturas antes e conhece o comércio da região. Mesma jogada: presencial e
  WhatsApp, dono a dono, começando por Xanxerê e cidades vizinhas.
- Oferta de entrada fácil: primeira vaga analisada grátis, ou um mês, pra ele sentir o valor com um
  candidato real dele.
- Prova social local: 2 ou 3 comércios conhecidos usando já viram argumento pros próximos.

---

## 9. O que isso muda no build (ajustes no CLAUDE.md)

O roadmap técnico continua quase igual, mas duas fases mudam de forma:

- **Fase 5 (empresa):** além de criar vaga com alvo DISC, a empresa **gera um link/QR público do quiz**
  pra distribuir pros próprios candidatos. Essa é a função central do MVP.
- **Fase 4 (candidato):** vira **quiz por link público**, sem onboarding pesado e sem exigir baixar o
  app. Só consentimento LGPD + dados mínimos + quiz. Conta de candidato completa fica pra depois.
- **Fase 6 (deck/matching):** o deck da empresa mostra **os candidatos que responderam ao link daquela
  vaga**, ordenados por score. Ainda não é busca no pool global.
- **Marketplace (deck de vagas pro candidato + busca bilateral):** sai do MVP e vira fase posterior,
  ligada só quando o pool encher (seção 6, etapa 2).

O motor de score DISC, a stack, a segurança e a auditoria não mudam. Só muda quem alimenta o funil de
candidato: no MVP é a própria empresa, não um pool que você precisa encher antes.

---

## 10. Pendências pra fechar (nenhuma trava o build começar)

- **Nome:** definir e checar em três lugares antes de casar: INPI (classe certa), domínio .com.br, e
  disponibilidade do nome na App Store e Play Store. Evitar "Match" (marca do Match Group) e qualquer
  coisa perto de Tinder.
- **Preço:** validar as faixas com 3 a 5 donos reais antes de fixar.
- **Custo da má contratação:** coletar o número local pra virar argumento de venda.
- **Alvos DISC por cargo:** montar a tabela de perfil ideal por função (atendimento, caixa, produção,
  etc.) pra o app sugerir sozinho.
