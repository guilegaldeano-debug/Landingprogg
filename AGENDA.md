# Semana — organizador (`/agenda`)

App separado dentro do mesmo deploy do LandingPro. Vive em `/agenda`
(ou `/agenda.html`); o dashboard de vendas continua intocado em `/`.

## Como adicionar tarefa

Escreve em português na barra do topo e dá Enter. O parser lê a frase e
separa data, hora, duração, prioridade, recorrência e lista:

| Você escreve | Vira |
|---|---|
| `reunião amanhã às 14h30 por 1h` | amanhã, 14:30, 60min |
| `dentista sexta 9h` | próxima sexta, 09:00 |
| `pagar boleto dia 15` | próximo dia 15 |
| `consulta 23/10` · `12 de dezembro` | data exata |
| `daqui a 3 dias revisar contrato` | hoje + 3 |
| `academia toda segunda, quarta e sexta 7h` | série semanal |
| `standup dias úteis 9h` | seg–sex |
| `relatório todo mês` · `backup cada 2 semanas` | mensal / quinzenal |
| `revisar proposta !!!` ou `p1` | prioridade alta |
| `estudar #estudos` | manda pra lista (cria se não existir) |

Sem data → cai no painel **Sem data**, e você arrasta pro dia que quiser.

## Atalhos

`n` ou `/` foca a entrada · `←` `→` navega · `h` volta pra hoje ·
`1` dia, `2` semana, `3` lista · `f` timer de foco · `Esc` fecha o modal.

## Recorrência

A tarefa guarda a **regra**, não cópias. Por isso:

- concluir uma ocorrência marca só aquele dia (`doneDates`);
- **Pular só em \<dia\>** no modal remove uma ocorrência sem quebrar a série (`skipDates`);
- **arrastar** uma tarefa recorrente reancora a série inteira (o app avisa);
- **Excluir série** apaga tudo.

## Limitações conhecidas (de propósito, não são bugs)

- **Dados só neste navegador** (`localStorage`). Não sincroniza entre PC e
  celular. Use *Exportar JSON* / *Importar JSON* pra levar de um pro outro.
- **Lembretes só com a aba aberta.** A Notification API do navegador não
  dispara com a aba fechada. Push de verdade exigiria backend + service
  worker + app nativo.
- Sem colaboração, sem anexos, sem subtarefas.

## Estrutura

```
agenda.html            entrada da página
src/agenda.jsx         bootstrap React
src/Organizer.jsx      UI (views, modal, timer)
src/organizer/dates.js      helpers de data (chave "YYYY-MM-DD")
src/organizer/parse.js      parser pt-BR da entrada rápida
src/organizer/recurrence.js expansão das séries
src/organizer/styles.js     CSS
```

`vite.config.js` tem duas entradas (`index.html` e `agenda.html`);
`netlify.toml` redireciona `/agenda` → `/agenda.html`.
