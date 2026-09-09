// Expansao de tarefas recorrentes.
// Nao materializamos ocorrencias no storage: a tarefa guarda a regra + a data-ancora,
// e cada dia da view pergunta "essa tarefa cai aqui?". Conclusoes de uma serie ficam
// em doneDates[] e remocoes pontuais em skipDates[].

import { diffDays, dowOf, fromKey, daysInMonthOf } from "./dates.js";

export function occursOn(task, key) {
  if (!task.date) return false;
  if (!task.repeat) return task.date === key;
  if (key < task.date) return false;
  if (task.repeat.until && key > task.repeat.until) return false;
  if (task.skipDates?.includes(key)) return false;

  const { freq, interval = 1, days } = task.repeat;
  const delta = diffDays(task.date, key);

  if (freq === "daily") return delta % interval === 0;

  if (freq === "weekdays") {
    const d = dowOf(key);
    return d >= 1 && d <= 5;
  }

  if (freq === "weekly") {
    const startDow = dowOf(task.date);
    const targetDows = days?.length ? days : [startDow];
    if (!targetDows.includes(dowOf(key))) return false;
    if (interval === 1) return true;
    // Semanas completas desde a segunda-feira da semana-ancora.
    const anchorMonday = -(((startDow + 6) % 7));
    const weeks = Math.floor((delta - anchorMonday) / 7);
    return weeks % interval === 0;
  }

  if (freq === "monthly") {
    const start = fromKey(task.date);
    const cur = fromKey(key);
    const months = (cur.getFullYear() - start.getFullYear()) * 12 + (cur.getMonth() - start.getMonth());
    if (months < 0 || months % interval !== 0) return false;
    // Dia 31 em mes de 30 cai no ultimo dia do mes.
    const target = Math.min(start.getDate(), daysInMonthOf(key));
    return cur.getDate() === target;
  }

  return false;
}

export function isDone(task, key) {
  return task.repeat ? !!task.doneDates?.includes(key) : !!task.done;
}

// Ordena por horario, depois prioridade (maior primeiro), depois criacao.
export function sortTasks(a, b) {
  const ta = a.time ?? "99:99";
  const tb = b.time ?? "99:99";
  if (ta !== tb) return ta < tb ? -1 : 1;
  if (a.priority !== b.priority) return b.priority - a.priority;
  return (a.createdAt ?? 0) - (b.createdAt ?? 0);
}

export function tasksForDay(tasks, key) {
  return tasks.filter((t) => occursOn(t, key)).sort(sortTasks);
}
