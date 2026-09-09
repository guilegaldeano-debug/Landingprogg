import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  todayKey, addDaysKey, weekKeys, startOfWeekKey, labelDate, labelRange,
  fromKey, toKey, diffDays, dowOf, DOW_SHORT, DOW_LONG, MONTH_LONG,
  formatDuration, endTime, timeToMin, pad,
} from "./organizer/dates.js";
import { parseInput, describeRepeat, norm } from "./organizer/parse.js";
import { occursOn, isDone, sortTasks, tasksForDay } from "./organizer/recurrence.js";
import { CSS } from "./organizer/styles.js";

/* ------------------------------------------------------------------ */
/* Persistencia                                                        */
/* ------------------------------------------------------------------ */

const LS_TASKS = "wk_tasks";
const LS_LISTS = "wk_lists";
const LS_PREFS = "wk_prefs";

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const DEFAULT_LISTS = [
  { id: "pessoal", name: "Pessoal", color: "#3b82f6" },
  { id: "trabalho", name: "Trabalho", color: "#a78bfa" },
  { id: "saude", name: "Saúde", color: "#22c55e" },
  { id: "estudos", name: "Estudos", color: "#f59e0b" },
];

const LIST_PALETTE = ["#3b82f6", "#a78bfa", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

const PRIORITY_COLOR = ["var(--line2)", "var(--accent)", "var(--warn)", "var(--bad)"];
const PRIORITY_LABEL = ["Sem prioridade", "Baixa", "Média", "Alta"];

const DAY_CAPACITY = 8 * 60; // referencia da barra de carga: 8h por dia

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || uid();

/* ------------------------------------------------------------------ */
/* Cartao de tarefa                                                    */
/* ------------------------------------------------------------------ */

function TaskCard({ task, dateKey, list, onToggle, onOpen, onDragStart, onDragEnd, dragging }) {
  const done = isDone(task, dateKey);
  const overdue = !done && task.date && !task.repeat && task.date < todayKey();
  return (
    <div
      className={`task${done ? " done" : ""}${dragging ? " dragging" : ""}`}
      style={{ borderLeftColor: list?.color ?? "var(--line2)" }}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={(e) => { if (!e.target.closest(".check")) onOpen(task, dateKey); }}
    >
      <button
        className="check"
        title={done ? "Reabrir" : "Concluir"}
        onClick={(e) => { e.stopPropagation(); onToggle(task, dateKey); }}
      >
        {done ? "✓" : ""}
      </button>
      <div className="mid">
        <div className="t">
          {task.priority > 0 && <i className={`pri p${task.priority}`} title={PRIORITY_LABEL[task.priority]} />}
          {task.title}
        </div>
        <div className="meta">
          {task.time && (
            <span className="time">
              {task.time}
              {task.duration ? `–${endTime(task.time, task.duration)}` : ""}
            </span>
          )}
          {!task.time && task.duration ? <span>{formatDuration(task.duration)}</span> : null}
          {task.repeat && <span className="rep" title={`Repete: ${describeRepeat(task.repeat)}`}>↻</span>}
          {overdue && <span className="late">atrasada</span>}
          {task.notes && <span title={task.notes}>≡</span>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Entrada rapida                                                      */
/* ------------------------------------------------------------------ */

function QuickAdd({ inputRef, value, onChange, onSubmit, preview, lists }) {
  const [focused, setFocused] = useState(false);
  const list = preview?.list ? lists.find((l) => norm(l.name) === norm(preview.list)) : null;
  const has = value.trim().length > 0;

  return (
    <div className={`qa${focused ? " focus" : ""}`}>
      <div className="row">
        <span className="plus">+</span>
        <input
          ref={inputRef}
          value={value}
          placeholder="O que precisa ser feito?"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        />
        <button className="addbtn" disabled={!has} onClick={onSubmit}>Adicionar</button>
      </div>

      {has && preview && (
        <div className="chips">
          <span className="chip">{preview.title || "sem título"}</span>
          {preview.date && <span className="chip b">{labelDate(preview.date)}</span>}
          {preview.time && <span className="chip b">{preview.time}</span>}
          {preview.duration && <span className="chip">{formatDuration(preview.duration)}</span>}
          {preview.repeat && <span className="chip v">↻ {describeRepeat(preview.repeat)}</span>}
          {preview.priority > 0 && (
            <span className={`chip ${preview.priority === 3 ? "r" : "a"}`}>{PRIORITY_LABEL[preview.priority]}</span>
          )}
          {preview.list && (
            <span className="chip" style={{ borderColor: (list?.color || "#7c8db0") + "88", color: list?.color || "#7c8db0" }}>
              #{preview.list}{list ? "" : " (nova)"}
            </span>
          )}
          {!preview.date && <span className="chip">sem data → backlog</span>}
        </div>
      )}

      {!has && focused && (
        <div className="hint">
          <span className="ex">ex: reunião amanhã às 14h30 por 1h !! #trabalho</span><br />
          <code>amanhã</code> <code>sexta 15h</code> <code>dia 15</code> <code>23/10</code>{" "}
          <code>toda segunda e quarta</code> <code>dias úteis</code> <code>todo mês</code> <code>por 45min</code>{" "}
          <code>!!</code> prioridade · <code>#lista</code>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Visao de semana                                                     */
/* ------------------------------------------------------------------ */

function WeekView({ days, tasks, lists, showDone, drag, ...h }) {
  const t = todayKey();
  return (
    <div className="week">
      {days.map((key) => {
        const all = tasksForDay(tasks, key);
        const items = showDone ? all : all.filter((x) => !isDone(x, key));
        const doneCount = all.filter((x) => isDone(x, key)).length;
        // Carga = minutos ainda por fazer no dia. Responde "esse dia cabe mais alguma coisa?"
        const load = all.reduce((sum, x) => sum + (isDone(x, key) ? 0 : x.duration ?? 0), 0);
        return (
          <div
            key={key}
            className={[
              "col",
              key === t ? "today" : "",
              key < t ? "past" : "",
              drag.over === key ? "over" : "",
              items.length === 0 ? "empty-day" : "",
            ].join(" ").trim()}
            onDragOver={(e) => { e.preventDefault(); drag.setOver(key); }}
            onDragLeave={() => drag.over === key && drag.setOver(null)}
            onDrop={(e) => { e.preventDefault(); h.onDrop(key); }}
          >
            <div className="colhead">
              <div className="line1">
                <span className="dw">{DOW_SHORT[dowOf(key)]}</span>
                <span className="dn">{fromKey(key).getDate()}</span>
                <span className="n">{all.length ? `${doneCount}/${all.length}` : ""}</span>
              </div>
              {load > 0 && (
                <div className="load" title={`${formatDuration(load)} planejados neste dia`}>
                  <i className={load >= DAY_CAPACITY ? "full" : ""}
                     style={{ width: `${Math.min(100, (load / DAY_CAPACITY) * 100)}%` }} />
                </div>
              )}
            </div>
            {items.length === 0 ? (
              <div className="empty">—</div>
            ) : (
              items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  dateKey={key}
                  list={lists.find((l) => l.id === task.listId)}
                  dragging={drag.id === task.id}
                  onToggle={h.onToggle}
                  onOpen={h.onOpen}
                  onDragStart={h.onDragStart}
                  onDragEnd={h.onDragEnd}
                />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Visao de dia (linha do tempo)                                       */
/* ------------------------------------------------------------------ */

function DayView({ dayKey, tasks, lists, showDone, drag, ...h }) {
  const all = tasksForDay(tasks, dayKey);
  const visible = showDone ? all : all.filter((x) => !isDone(x, dayKey));
  const untimed = visible.filter((x) => !x.time);
  const timed = visible.filter((x) => x.time);

  const hours = useMemo(() => {
    const used = timed.map((x) => Math.floor(timeToMin(x.time) / 60));
    const from = Math.min(6, ...(used.length ? used : [6]));
    const to = Math.max(22, ...(used.length ? used : [22]));
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }, [timed]);

  const now = new Date();
  const isToday = dayKey === todayKey();

  return (
    <div>
      <div className="untimed">
        <div className="grouphead">
          <span>Sem horário</span><span className="line" /><span>{untimed.length}</span>
        </div>
        {untimed.length === 0 ? (
          <div className="empty">Nada solto neste dia</div>
        ) : (
          untimed.map((task) => (
            <TaskCard key={task.id} task={task} dateKey={dayKey} list={lists.find((l) => l.id === task.listId)}
              dragging={drag.id === task.id} onToggle={h.onToggle} onOpen={h.onOpen}
              onDragStart={h.onDragStart} onDragEnd={h.onDragEnd} />
          ))
        )}
      </div>

      <div className="day">
        {hours.map((hour) => {
          const slotKey = `${dayKey}@${pad(hour)}`;
          const inSlot = timed.filter((x) => Math.floor(timeToMin(x.time) / 60) === hour);
          const showNow = isToday && now.getHours() === hour;
          return (
            <div key={hour} style={{ display: "contents" }}>
              <div className="hr lbl">{pad(hour)}:00</div>
              <div
                className={`hr slot${drag.over === slotKey ? " over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); drag.setOver(slotKey); }}
                onDragLeave={() => drag.over === slotKey && drag.setOver(null)}
                onDrop={(e) => { e.preventDefault(); h.onDropTime(dayKey, `${pad(hour)}:00`); }}
              >
                {showNow && <div className="nowline" style={{ top: `${(now.getMinutes() / 60) * 100}%` }} />}
                {inSlot.map((task) => (
                  <TaskCard key={task.id} task={task} dateKey={dayKey} list={lists.find((l) => l.id === task.listId)}
                    dragging={drag.id === task.id} onToggle={h.onToggle} onOpen={h.onOpen}
                    onDragStart={h.onDragStart} onDragEnd={h.onDragEnd} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Visao de lista agrupada                                             */
/* ------------------------------------------------------------------ */

function ListView({ groups, lists, drag, ...h }) {
  if (groups.every((g) => g.items.length === 0)) {
    return <div className="empty" style={{ padding: 46 }}>Nada por aqui.</div>;
  }
  return (
    <div>
      {groups.map((g) =>
        g.items.length === 0 ? null : (
          <div className="group" key={g.key}>
            <div className="grouphead">
              <span style={g.color ? { color: g.color } : undefined}>{g.label}</span>
              <span className="line" />
              <span className="n">{g.items.length}</span>
            </div>
            <div className="stack">
              {g.items.map(({ task, dateKey }) => (
                <TaskCard key={`${task.id}-${dateKey ?? "x"}`} task={task} dateKey={dateKey}
                  list={lists.find((l) => l.id === task.listId)} dragging={drag.id === task.id}
                  onToggle={h.onToggle} onOpen={h.onOpen} onDragStart={h.onDragStart} onDragEnd={h.onDragEnd} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal de edicao                                                     */
/* ------------------------------------------------------------------ */

function TaskModal({ task, lists, onSave, onDelete, onSkip, onClose }) {
  const [draft, setDraft] = useState(() => ({
    ...task,
    repeat: task.repeat ? { interval: 1, ...task.repeat } : null,
  }));
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const freq = draft.repeat?.freq ?? "none";

  function setFreq(f) {
    if (f === "none") return set({ repeat: null });
    const days = f === "weekly" ? draft.repeat?.days ?? [dowOf(draft.date || todayKey())] : undefined;
    set({ repeat: { freq: f, interval: draft.repeat?.interval ?? 1, days, until: draft.repeat?.until ?? null } });
  }
  function toggleDow(d) {
    const cur = draft.repeat?.days ?? [];
    const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort();
    set({ repeat: { ...draft.repeat, days: next.length ? next : cur } });
  }

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>Editar tarefa</h3>

        <div className="field">
          <label>Título</label>
          <input className="inp" autoFocus value={draft.title} onChange={(e) => set({ title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onSave(draft)} />
        </div>

        <div className="field">
          <label>Notas</label>
          <textarea className="inp" value={draft.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} />
        </div>

        <div className="field grid3">
          <div>
            <label>Data</label>
            <input className="inp" type="date" value={draft.date ?? ""} onChange={(e) => set({ date: e.target.value || null })} />
          </div>
          <div>
            <label>Hora</label>
            <input className="inp" type="time" value={draft.time ?? ""} onChange={(e) => set({ time: e.target.value || null })} />
          </div>
          <div>
            <label>Duração (min)</label>
            <input className="inp" type="number" min="0" step="5" value={draft.duration ?? ""}
              onChange={(e) => set({ duration: e.target.value ? Number(e.target.value) : null })} />
          </div>
        </div>

        <div className="field">
          <label>Prioridade</label>
          <div className="pick">
            {PRIORITY_LABEL.map((lbl, i) => (
              <button key={i} className={draft.priority === i ? "on" : ""} onClick={() => set({ priority: i })}>
                {i > 0 && <i className={`pri p${i}`} />}{lbl}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Lista</label>
          <select className="inp" value={draft.listId ?? ""} onChange={(e) => set({ listId: e.target.value || null })}>
            <option value="">Sem lista</option>
            {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Repetir</label>
          <div className="pick">
            {[["none", "Não"], ["daily", "Diária"], ["weekdays", "Dias úteis"], ["weekly", "Semanal"], ["monthly", "Mensal"]].map(([f, lbl]) => (
              <button key={f} className={freq === f ? "on" : ""} onClick={() => setFreq(f)}>{lbl}</button>
            ))}
          </div>
        </div>

        {freq === "weekly" && (
          <div className="field">
            <label>Dias da semana</label>
            <div className="pick">
              {DOW_SHORT.map((d, i) => (
                <button key={i} className={draft.repeat?.days?.includes(i) ? "on" : ""} onClick={() => toggleDow(i)}>{d}</button>
              ))}
            </div>
          </div>
        )}

        {freq !== "none" && freq !== "weekdays" && (
          <div className="field grid2">
            <div>
              <label>A cada</label>
              <input className="inp" type="number" min="1" value={draft.repeat?.interval ?? 1}
                onChange={(e) => set({ repeat: { ...draft.repeat, interval: Math.max(1, Number(e.target.value) || 1) } })} />
            </div>
            <div>
              <label>Até (opcional)</label>
              <input className="inp" type="date" value={draft.repeat?.until ?? ""}
                onChange={(e) => set({ repeat: { ...draft.repeat, until: e.target.value || null } })} />
            </div>
          </div>
        )}

        {task.repeat && task._dateKey && (
          <button className="ghost" style={{ width: "100%", marginTop: 4 }}
            onClick={() => onSkip(task, task._dateKey)}>
            Pular só em {labelDate(task._dateKey)} (mantém a série)
          </button>
        )}

        <div className="acts">
          <button className="addbtn" style={{ flex: 1 }} onClick={() => onSave(draft)}>Salvar</button>
          <button className="ghost" onClick={onClose}>Cancelar</button>
          <button className="danger" onClick={() => onDelete(task.id)}>
            {task.repeat ? "Excluir série" : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timer de foco (pomodoro)                                            */
/* ------------------------------------------------------------------ */

const WORK_SECS = 25 * 60;
const BREAK_SECS = 5 * 60;

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
    osc.start(); osc.stop(ctx.currentTime + 0.72);
  } catch {}
}

function FocusTimer({ state, setState, taskTitle }) {
  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(() => {
      setState((s) => {
        if (s.left > 1) return { ...s, left: s.left - 1 };
        beep();
        const nextMode = s.mode === "work" ? "break" : "work";
        return {
          ...s,
          mode: nextMode,
          left: nextMode === "work" ? WORK_SECS : BREAK_SECS,
          rounds: s.mode === "work" ? s.rounds + 1 : s.rounds,
          running: false,
        };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.running, setState]);

  if (!state.open) {
    return <button className="fab" title="Timer de foco" onClick={() => setState((s) => ({ ...s, open: true }))}>⏱</button>;
  }

  const mm = pad(Math.floor(state.left / 60));
  const ss = pad(state.left % 60);

  return (
    <div className={`ftimer${state.running ? " run" : ""}`}>
      <div className="lab">{state.mode === "work" ? "Foco" : "Pausa"} · {state.rounds} ciclo{state.rounds === 1 ? "" : "s"}</div>
      <div className="clock">{mm}:{ss}</div>
      <div className="task-name">{taskTitle || "sem tarefa selecionada"}</div>
      <div className="btns">
        <button className="pri-btn" onClick={() => setState((s) => ({ ...s, running: !s.running }))}>
          {state.running ? "Pausar" : "Iniciar"}
        </button>
        <button onClick={() => setState((s) => ({ ...s, running: false, left: s.mode === "work" ? WORK_SECS : BREAK_SECS }))}>
          Zerar
        </button>
        <button onClick={() => setState((s) => ({ ...s, open: false, running: false }))}>✕</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function Organizer() {
  const [tasks, setTasks] = useState(() => load(LS_TASKS, []));
  const [lists, setLists] = useState(() => load(LS_LISTS, DEFAULT_LISTS));
  const [prefs, setPrefs] = useState(() => load(LS_PREFS, { showDone: false, view: "semana" }));

  const [view, setView] = useState(prefs.view ?? "semana");
  const [anchor, setAnchor] = useState(todayKey());
  const [filterList, setFilterList] = useState(null);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [focus, setFocus] = useState({ open: false, running: false, mode: "work", left: WORK_SECS, rounds: 0, taskId: null });

  const theme = prefs.theme ?? "dark";
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0a0e17" : "#f5f7fb");
  }, [theme]);

  const inputRef = useRef(null);
  const undoRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => save(LS_TASKS, tasks), [tasks]);
  useEffect(() => save(LS_LISTS, lists), [lists]);
  useEffect(() => save(LS_PREFS, { ...prefs, view }), [prefs, view]);

  /* ---------------- derivados ---------------- */

  const visibleTasks = useMemo(() => {
    let out = tasks;
    if (filterList) out = out.filter((t) => t.listId === filterList);
    if (query.trim()) {
      const q = norm(query.trim());
      out = out.filter((t) => norm(t.title).includes(q) || norm(t.notes ?? "").includes(q));
    }
    return out;
  }, [tasks, filterList, query]);

  const days = useMemo(() => weekKeys(anchor), [anchor]);

  const backlog = useMemo(
    () => visibleTasks.filter((t) => !t.date && !t.done).sort(sortTasks),
    [visibleTasks]
  );

  const weekStats = useMemo(() => {
    let done = 0, total = 0;
    for (const key of days) {
      for (const t of tasks) {
        if (!occursOn(t, key)) continue;
        total++;
        if (isDone(t, key)) done++;
      }
    }
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [days, tasks]);

  const counts = useMemo(() => {
    const t = todayKey();
    const today = tasks.filter((x) => occursOn(x, t) && !isDone(x, t)).length;
    const overdue = tasks.filter((x) => x.date && !x.repeat && !x.done && x.date < t).length;
    const next7 = new Set();
    for (let i = 0; i < 7; i++) {
      const k = addDaysKey(t, i);
      tasks.forEach((x) => { if (occursOn(x, k) && !isDone(x, k)) next7.add(`${x.id}@${k}`); });
    }
    const byList = {};
    lists.forEach((l) => {
      byList[l.id] = tasks.filter((x) => x.listId === l.id && !x.done).length;
    });
    return { today, overdue, next7: next7.size, backlog: backlog.length, byList };
  }, [tasks, lists, backlog.length]);

  const streak = useMemo(() => {
    let n = 0;
    for (let i = 0; i < 400; i++) {
      const k = addDaysKey(todayKey(), -i);
      const hit = tasks.some((t) => (t.repeat ? t.doneDates?.includes(k) : t.done && t.doneAt === k));
      if (hit) n++;
      else if (i > 0) break; // dia de hoje ainda pode estar vazio
    }
    return n;
  }, [tasks]);

  const preview = useMemo(() => (input.trim() ? parseInput(input) : null), [input]);

  /* ---------------- acoes ---------------- */

  const ensureList = useCallback((name) => {
    if (!name) return { id: null, lists };
    const found = lists.find((l) => norm(l.name) === norm(name));
    if (found) return { id: found.id, lists };
    const created = {
      id: slug(name),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      color: LIST_PALETTE[lists.length % LIST_PALETTE.length],
    };
    return { id: created.id, lists: [...lists, created] };
  }, [lists]);

  function addTask() {
    const raw = input.trim();
    if (!raw) return;
    const p = parseInput(raw);
    const { id: listId, lists: nextLists } = ensureList(p.list);
    if (nextLists !== lists) setLists(nextLists);

    const task = {
      id: uid(),
      title: p.title || raw,
      notes: "",
      date: p.date ?? (view === "hoje" ? anchor : null),
      time: p.time,
      duration: p.duration,
      priority: p.priority,
      listId: listId ?? filterList ?? null,
      repeat: p.repeat,
      done: false,
      doneAt: null,
      doneDates: [],
      skipDates: [],
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, task]);
    setInput("");
  }

  function toggleTask(task, dateKey) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== task.id) return t;
        if (t.repeat) {
          const set = new Set(t.doneDates ?? []);
          set.has(dateKey) ? set.delete(dateKey) : set.add(dateKey);
          return { ...t, doneDates: [...set] };
        }
        return { ...t, done: !t.done, doneAt: !t.done ? todayKey() : null };
      })
    );
  }

  function saveTask(draft) {
    const { _dateKey, ...clean } = draft;
    setTasks((prev) => prev.map((t) => (t.id === clean.id ? { ...t, ...clean } : t)));
    setEditing(null);
  }

  // Remove uma unica ocorrencia de uma serie, sem mexer na regra.
  function skipOccurrence(task, dateKey) {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, skipDates: [...new Set([...(t.skipDates ?? []), dateKey])] } : t))
    );
    setEditing(null);
    setToast(`"${task.title}" pulada em ${labelDate(dateKey)}`);
  }

  function deleteTask(id) {
    const victim = tasks.find((t) => t.id === id);
    undoRef.current = victim;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setEditing(null);
    setToast(`"${victim?.title ?? "Tarefa"}" excluída`);
  }

  function undoDelete() {
    if (undoRef.current) setTasks((prev) => [...prev, undoRef.current]);
    undoRef.current = null;
    setToast(null);
  }

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  function moveTask(dateKey, time) {
    if (!dragId) return;
    const moved = tasks.find((t) => t.id === dragId);
    setTasks((prev) =>
      prev.map((t) => (t.id === dragId ? { ...t, date: dateKey, ...(time ? { time } : {}) } : t))
    );
    if (moved?.repeat && dateKey) {
      setToast(`"${moved.title}" é recorrente — a série inteira passou a começar em ${labelDate(dateKey)}`);
    }
    setDragId(null);
    setDragOver(null);
  }

  function addList() {
    const name = prompt("Nome da nova lista:");
    if (!name?.trim()) return;
    setLists((prev) => [
      ...prev,
      { id: slug(name), name: name.trim(), color: LIST_PALETTE[prev.length % LIST_PALETTE.length] },
    ]);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), tasks, lists }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agenda-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data.tasks)) throw new Error("formato inválido");
        const known = new Set(tasks.map((t) => t.id));
        const merged = [...tasks, ...data.tasks.filter((t) => !known.has(t.id))];
        setTasks(merged);
        if (Array.isArray(data.lists)) {
          const ids = new Set(lists.map((l) => l.id));
          setLists([...lists, ...data.lists.filter((l) => !ids.has(l.id))]);
        }
        setToast(`${merged.length - tasks.length} tarefa(s) importada(s)`);
      } catch (err) {
        setToast(`Falha ao importar: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }

  /* ---------------- lembretes (só com a aba aberta) ---------------- */

  const notifiedRef = useRef(new Set());
  useEffect(() => {
    if (!("Notification" in window)) return;
    const id = setInterval(() => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const key = todayKey();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      tasks.forEach((t) => {
        if (!t.time || !occursOn(t, key) || isDone(t, key)) return;
        const min = timeToMin(t.time);
        const tag = `${t.id}@${key}`;
        if (min - nowMin <= 0 && min - nowMin > -2 && !notifiedRef.current.has(tag)) {
          notifiedRef.current.add(tag);
          new Notification(t.title, { body: `Agora · ${t.time}`, tag });
        }
      });
    }, 30000);
    return () => clearInterval(id);
  }, [tasks]);

  /* ---------------- atalhos ---------------- */

  useEffect(() => {
    function onKey(e) {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (e.key === "Escape") { setEditing(null); e.target.blur?.(); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "n" || e.key === "/") { e.preventDefault(); inputRef.current?.focus(); }
      else if (e.key === "ArrowLeft") setAnchor((a) => addDaysKey(a, view === "dia" ? -1 : -7));
      else if (e.key === "ArrowRight") setAnchor((a) => addDaysKey(a, view === "dia" ? 1 : 7));
      else if (e.key === "h" || e.key === "t") setAnchor(todayKey());
      else if (e.key === "1") setView("hoje");
      else if (e.key === "2") setView("semana");
      else if (e.key === "3") setView("proximos");
      else if (e.key === "f") setFocus((s) => ({ ...s, open: !s.open }));
      else if (e.key === "d") setPrefs((p) => ({ ...p, theme: (p.theme ?? "dark") === "dark" ? "light" : "dark" }));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  /* ---------------- grupos das visões de lista ---------------- */

  const listGroups = useMemo(() => {
    const t = todayKey();
    const showDone = prefs.showDone;
    const groups = [];

    const overdue = visibleTasks
      .filter((x) => x.date && !x.repeat && !x.done && x.date < t)
      .sort(sortTasks)
      .map((task) => ({ task, dateKey: task.date }));
    if (overdue.length) groups.push({ key: "atrasadas", label: "Atrasadas", color: "#fca5a5", items: overdue });

    const horizon = view === "proximos" ? 7 : 30;
    for (let i = 0; i < horizon; i++) {
      const key = addDaysKey(t, i);
      const items = tasksForDay(visibleTasks, key)
        .filter((x) => showDone || !isDone(x, key))
        .map((task) => ({ task, dateKey: key }));
      if (items.length) groups.push({ key, label: labelDate(key), items });
    }

    // Tudo o que cai depois do horizonte agrupa em "Mais adiante" — nada some da visao "Todas".
    if (view === "tudo") {
      const limit = addDaysKey(t, horizon);
      const later = visibleTasks
        .filter((x) => x.date && x.date >= limit && (showDone || !isDone(x, x.date)))
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((task) => ({ task, dateKey: task.date }));
      if (later.length) groups.push({ key: "later", label: "Mais adiante", items: later });
    }

    if (backlog.length) groups.push({ key: "backlog", label: "Sem data", items: backlog.map((task) => ({ task, dateKey: null })) });

    if (view === "concluidas") {
      const doneItems = visibleTasks
        .filter((x) => x.done || x.doneDates?.length)
        .sort((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""))
        .map((task) => ({ task, dateKey: task.doneAt ?? task.date }));
      return [{ key: "done", label: "Concluídas", items: doneItems }];
    }

    return groups;
  }, [visibleTasks, backlog, view, prefs.showDone]);

  /* ---------------- render ---------------- */

  const dragCtx = { id: dragId, over: dragOver, setOver: setDragOver };
  const handlers = {
    onToggle: toggleTask,
    onOpen: (task, dateKey) => setEditing({ ...task, _dateKey: dateKey }),
    onDragStart: (e, task) => { setDragId(task.id); e.dataTransfer.effectAllowed = "move"; },
    onDragEnd: () => { setDragId(null); setDragOver(null); },
    onDrop: (key) => moveTask(key),
    onDropTime: (key, time) => moveTask(key, time),
  };

  const headTitle =
    view === "semana" ? labelRange(days) :
    view === "dia" || view === "hoje" ? `${DOW_LONG[dowOf(anchor)]}, ${fromKey(anchor).getDate()} de ${MONTH_LONG[fromKey(anchor).getMonth()]}` :
    view === "proximos" ? "Próximos 7 dias" :
    view === "concluidas" ? "Concluídas" : "Todas as tarefas";

  const focusTask = tasks.find((t) => t.id === focus.taskId);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* ---------- sidebar ---------- */}
        <aside className="side">
          <div className="brand">
            <div className="mark">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <rect x="1" y="3" width="3" height="9" rx="1.2" fill="currentColor" opacity=".55" />
                <rect x="6" y="1" width="3" height="13" rx="1.2" fill="currentColor" />
                <rect x="11" y="5" width="3" height="6" rx="1.2" fill="currentColor" opacity=".55" />
              </svg>
            </div>
            <div>
              <b>Semana</b>
              <span>{labelDate(todayKey())} · {DOW_LONG[dowOf(todayKey())]}</span>
            </div>
          </div>

          <div>
            <div className="sec">VISÕES</div>
            <div className="grp">
              {[
                ["hoje", "Hoje", "◎", counts.today],
                ["semana", "Semana", "▤", null],
                ["proximos", "Próximos 7", "→", counts.next7],
                ["tudo", "Todas", "≡", null],
                ["concluidas", "Concluídas", "✓", null],
              ].map(([id, label, icon, count]) => (
                <button key={id} className={`navbtn${view === id ? " on" : ""}`}
                  onClick={() => { setView(id); if (id === "hoje") setAnchor(todayKey()); }}>
                  <span className="ico">{icon}</span>
                  {label}
                  {count ? <span className="cnt">{count}</span> : null}
                </button>
              ))}
              {counts.overdue > 0 && (
                <button className="navbtn" onClick={() => setView("proximos")} style={{ color: "var(--bad)" }}>
                  <span className="ico" style={{ color: "var(--bad)" }}>!</span>
                  Atrasadas
                  <span className="cnt" style={{ color: "var(--bad)" }}>{counts.overdue}</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="sec">LISTAS</div>
            <div className="grp">
              <button className={`navbtn${filterList === null ? " on" : ""}`} onClick={() => setFilterList(null)}>
                <span className="dot" style={{ background: "#4a5a7d" }} />
                Todas
              </button>
              {lists.map((l) => (
                <button key={l.id} className={`navbtn${filterList === l.id ? " on" : ""}`}
                  onClick={() => setFilterList(filterList === l.id ? null : l.id)}>
                  <span className="dot" style={{ background: l.color }} />
                  {l.name}
                  {counts.byList[l.id] ? <span className="cnt">{counts.byList[l.id]}</span> : null}
                </button>
              ))}
              <button className="navbtn" onClick={addList} style={{ color: "var(--dim)" }}>
                <span className="ico">+</span> Nova lista
              </button>
            </div>
          </div>

          <div className="foot">
            <div className="streak">
              <div>
                <b>{streak}</b>
                <span>{streak === 1 ? "dia seguido" : "dias seguidos"}</span>
              </div>
              <div>
                <b>{counts.backlog}</b>
                <span>sem data</span>
              </div>
            </div>

            <div className="toolrow">
              <button className="tool" title={theme === "dark" ? "Tema claro" : "Tema escuro"}
                onClick={() => setPrefs((p) => ({ ...p, theme: theme === "dark" ? "light" : "dark" }))}>
                {theme === "dark" ? "☀" : "☾"}
              </button>
              <button className={`tool${prefs.showDone ? " on" : ""}`}
                title={prefs.showDone ? "Ocultar concluídas" : "Mostrar concluídas"}
                onClick={() => setPrefs((p) => ({ ...p, showDone: !p.showDone }))}>✓</button>
              <button className="tool" title="Exportar JSON" onClick={exportJSON}>↓</button>
              <button className="tool" title="Importar JSON" onClick={() => fileRef.current?.click()}>↑</button>
              {"Notification" in window && Notification.permission === "default" && (
                <button className="tool" title="Ativar lembretes (só com a aba aberta)"
                  onClick={() => Notification.requestPermission()}>◔</button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importJSON(f); e.target.value = ""; }} />

            <div className="note">Dados só neste navegador.<br />Lembretes só com a aba aberta.</div>
          </div>
        </aside>

        {/* ---------- main ---------- */}
        <main className="main">
          <div className="top">
            <div>
              <h1 className="h1">{headTitle}</h1>
              <div className="sub">
                {view === "semana"
                  ? `${weekStats.done} de ${weekStats.total} concluídas nesta semana`
                  : `${counts.today} para hoje · ${counts.overdue} atrasada(s)`}
              </div>
            </div>

            {(view === "semana" || view === "hoje" || view === "dia") && (
              <div className="nav">
                <button className="icobtn" title="Anterior"
                  onClick={() => setAnchor(addDaysKey(anchor, view === "semana" ? -7 : -1))}>‹</button>
                <button className="icobtn txt" title="Voltar para hoje"
                  onClick={() => setAnchor(todayKey())}>Hoje</button>
                <button className="icobtn" title="Próximo"
                  onClick={() => setAnchor(addDaysKey(anchor, view === "semana" ? 7 : 1))}>›</button>
              </div>
            )}

            <div className="seg">
              {[["hoje", "Dia"], ["semana", "Semana"], ["proximos", "Lista"]].map(([id, lbl]) => (
                <button key={id} className={view === id ? "on" : ""} onClick={() => setView(id)}>{lbl}</button>
              ))}
            </div>

            <div className="spacer" />

            <input className="search" placeholder="Buscar…" value={query}
              onChange={(e) => setQuery(e.target.value)} />

            {view === "semana" && (
              <div className="progress">
                <div className="bar"><i style={{ width: `${weekStats.pct}%` }} /></div>
                <span>{weekStats.pct}%</span>
              </div>
            )}
          </div>

          <QuickAdd inputRef={inputRef} value={input} onChange={setInput} onSubmit={addTask}
            preview={preview} lists={lists} />

          <div className="body">
            {view === "semana" && (
              <div className="split">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <WeekView days={days} tasks={visibleTasks} lists={lists} showDone={prefs.showDone}
                    drag={dragCtx} {...handlers} />
                </div>
                <div className={`backlog${prefs.showBacklog === false ? " closed" : ""}`}>
                  <div className="grouphead">
                    <span>Sem data</span>
                    {prefs.showBacklog !== false && <span className="line" />}
                    <span>{backlog.length}</span>
                    <button className="collapse" title={prefs.showBacklog === false ? "Abrir" : "Recolher"}
                      onClick={() => setPrefs((p) => ({ ...p, showBacklog: p.showBacklog === false }))}>
                      {prefs.showBacklog === false ? "‹" : "›"}
                    </button>
                  </div>
                  {prefs.showBacklog !== false && <div className={`panel${dragOver === "backlog" ? " over" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver("backlog"); }}
                    onDragLeave={() => dragOver === "backlog" && setDragOver(null)}
                    onDrop={(e) => { e.preventDefault(); moveTask(null); }}>
                    {backlog.length === 0 ? (
                      <div className="empty">Arraste tarefas pra cá<br />pra tirar do calendário</div>
                    ) : (
                      backlog.map((task) => (
                        <TaskCard key={task.id} task={task} dateKey={null}
                          list={lists.find((l) => l.id === task.listId)} dragging={dragId === task.id}
                          onToggle={toggleTask} onOpen={setEditing}
                          onDragStart={handlers.onDragStart} onDragEnd={handlers.onDragEnd} />
                      ))
                    )}
                  </div>}
                </div>
              </div>
            )}

            {(view === "hoje" || view === "dia") && (
              <DayView dayKey={anchor} tasks={visibleTasks} lists={lists} showDone={prefs.showDone}
                drag={dragCtx} {...handlers} />
            )}

            {(view === "proximos" || view === "tudo" || view === "concluidas") && (
              <ListView groups={listGroups} lists={lists} drag={dragCtx} {...handlers} />
            )}
          </div>
        </main>
      </div>

      {editing && (
        <TaskModal task={editing} lists={lists} onSave={saveTask} onDelete={deleteTask}
          onSkip={skipOccurrence} onClose={() => setEditing(null)} />
      )}

      <FocusTimer state={focus} setState={setFocus} taskTitle={focusTask?.title} />

      {toast && (
        <div className="toast">
          <span>{toast}</span>
          {undoRef.current && <button onClick={undoDelete}>Desfazer</button>}
        </div>
      )}
    </>
  );
}
