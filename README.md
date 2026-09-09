# Semana — organizador de semana e dia

App de tarefas com foco em planejar a semana: captura rápida em português,
recorrência, arrastar-e-soltar entre dias e timer de foco.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

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
`1` dia, `2` semana, `3` lista · `f` timer de foco · `d` alterna tema ·
`Esc` fecha o modal.

## Leitura visual

A interface segue a linguagem do macOS: separação por material e espaço em
vez de contorno, cor só no que é interativo, fonte do sistema (SF Pro no
Mac — nenhuma fonte é baixada da web).

- **Compromisso** (tem hora) aparece como bloco de calendário, tintado com a
  cor da lista. **Tarefa** (sem hora) aparece como linha de lista com círculo.
  É a distinção entre Calendar e Reminders, e ela vale: uma ocupa um horário,
  a outra só precisa acontecer no dia.
- **`!` `!!` `!!!`** em vermelho antes do título = prioridade.
- **Número do dia em círculo azul** = hoje.
- **Texto à direita no cabeçalho do dia** ("3h15") = quanto já está
  comprometido, para responder "esse dia ainda cabe alguma coisa?".
- Tema claro e escuro; segue o sistema na primeira visita, atalho `d`.

O texto dos blocos é colorido na mesma matiz da lista — clara no tema
escuro, escura no claro. Sem isso, laranja diluído sobre cinza escuro lê
como marrom. Todas as combinações foram medidas em WCAG AA.

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
index.html             entrada da página
src/main.jsx           bootstrap React
src/Organizer.jsx      UI (views, modal, timer)
src/organizer/dates.js      helpers de data (chave "YYYY-MM-DD")
src/organizer/parse.js      parser pt-BR da entrada rápida
src/organizer/recurrence.js expansão das séries
src/organizer/styles.js     CSS e tokens dos dois temas
src/organizer/icons.jsx     ícones de traço (sem dependência externa)
```

Build padrão do Vite; o `netlify.toml` só publica `dist/`. Não há backend:
o app é inteiramente estático.
