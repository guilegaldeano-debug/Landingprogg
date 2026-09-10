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

### Em que dia a tarefa entra

Quando a frase não diz a data, a tarefa entra no **dia mirado**, mostrado no
canto direito do campo. O alvo acompanha o que você está olhando — o dia
aberto na vista Dia, hoje na vista Semana — e você muda de três jeitos:

- o seletor ao lado do campo (no celular abre o picker do sistema);
- o **+** no cabeçalho de qualquer dia da semana;
- clicando numa **hora vaga** na vista Dia, que mira o dia *e* a hora.

O dia mirado fica destacado na grade. Escrever a data na frase sempre vence o
seletor, e nesse caso ele mostra o que foi entendido, travado.

Para deixar sem data, escolha **Sem data** no seletor — aí vai para o painel
lateral e você arrasta pro dia depois.

Depois de adicionar, o foco e o alvo continuam onde estavam, então dá para
despejar várias tarefas no mesmo dia em sequência.

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

## Sincronização entre dispositivos

O app roda de dois jeitos, e detecta sozinho em qual está:

| Onde | Armazenamento | Sincroniza? |
|---|---|---|
| Publicado como Artifact | banco do Artifact, na conta de quem abre | **Sim**, PC e celular |
| Netlify, `npm run dev`, arquivo local | `localStorage` | Não |

Sem servidor próprio e sem mensalidade. Cada tarefa é um documento em
`tasks/<id>`; as listas ficam em `meta/lists`. Conflito resolve por
`updatedAt` — quem editou por último vence. Para uma pessoa alternando entre
dois aparelhos isso basta; não há edição simultânea de verdade.

A camada inteira está em `src/organizer/sync.js` e degrada sozinha: fora do
Artifact não existe `window.claude`, `open()` devolve `null` e o app segue em
`localStorage` sem nenhuma diferença de comportamento.

### Publicar uma nova versão

```bash
npm run build:artifact     # gera dist-artifact/semana.artifact.html
```

Depois publique esse arquivo como Artifact declarando
`capabilities: {db: {}, downloads: true}`. Republicar no mesmo endereço
preserva os dados.

## Limitações conhecidas (de propósito, não são bugs)

- **Lembretes só com a aba aberta.** A Notification API do navegador não
  dispara com a aba fechada. Push de verdade exigiria backend + service
  worker + app nativo.
- **Sincronizar exige estar logado na conta Claude** nos dois aparelhos. Se
  isso incomodar, a alternativa é trocar `sync.js` por Supabase ou Firebase —
  ambos têm plano gratuito folgado pra um app de uma pessoa.
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
