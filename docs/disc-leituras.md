# Leituras em linguagem simples — perfil DISC → frases do card

> Fonte única do texto do card (CLAUDE.md §4: não improvisar frase no código).
> Determinístico: mesmo vetor → mesma leitura, no app e em qualquer relatório.

## 1. Regra de montagem

1. **Eixo dominante** = maior valor entre d/i/s/c. Empate: vence o que vem primeiro na ordem
   fixa **D → I → S → C**.
2. **Eixo secundário** = segundo maior, mesma regra de desempate (excluído o dominante).
3. Leitura do card = `rotulo(dominante)` + `frase_dominante(dominante)` + `frase_secundaria(secundário)`.
   Formato: **"{rotulo}. {frase_dominante} {frase_secundaria}"**

## 2. Tabelas de texto

### Rótulo e frase do eixo DOMINANTE

| Eixo | Rótulo | Frase dominante |
|---|---|---|
| D | Direto e decidido | Resolve rápido, gosta de meta e não foge de problema — bom pra correria, cobrança de resultado e liderar a frente de trabalho. |
| I | Comunicativo | Conversa fácil, anima o ambiente e conquista o cliente — bom pra atendimento, vendas e qualquer função com gente o dia todo. |
| S | Constante e parceiro | Estável, paciente e leal ao time — aguenta rotina e função repetitiva sem perder a qualidade do trato. |
| C | Caprichoso e detalhista | Organizado, segue o processo e confere antes de entregar — bom pra caixa, estoque, controle e tarefa de precisão. |

### Frase do eixo SECUNDÁRIO (complemento)

| Eixo | Frase secundária |
|---|---|
| D | Também tem iniciativa: quando precisa, toma a frente. |
| I | Também se dá bem com gente: comunica sem travar. |
| S | Também é constante: mantém o ritmo e apoia o time. |
| C | Também é cuidadoso: presta atenção no detalhe. |

## 3. Exemplos (fixtures — usar nos testes)

| Vetor [d,i,s,c] | Dominante | Secundário | Leitura |
|---|---|---|---|
| [17, 48, 25, 10] | I | S | "Comunicativo. Conversa fácil, anima o ambiente e conquista o cliente — bom pra atendimento, vendas e qualquer função com gente o dia todo. Também é constante: mantém o ritmo e apoia o time." |
| [10, 15, 40, 35] | S | C | "Constante e parceiro. Estável, paciente e leal ao time — aguenta rotina e função repetitiva sem perder a qualidade do trato. Também é cuidadoso: presta atenção no detalhe." |
| [25, 25, 25, 25] | D (empate → ordem D>I>S>C) | I (empate → ordem) | "Direto e decidido. (...) Também se dá bem com gente: comunica sem travar." |
| [60, 10, 20, 10] | D | S | "Direto e decidido. (...) Também é constante: mantém o ritmo e apoia o time." |

## 4. Onde mora no código

Implementar como função pura em `lib/disc.ts` (`leituraDoPerfil(vetor)`) lendo as tabelas DESTE
arquivo (constantes geradas daqui, não redigitadas). Testes cobrem os 4 exemplos acima + os
empates. A RPC `get_deck` NÃO devolve a leitura: o app monta a partir do vetor (evita duplicar
texto no banco).
