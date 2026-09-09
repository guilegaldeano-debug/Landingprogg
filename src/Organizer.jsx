import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  todayKey, addDaysKey, weekKeys, startOfWeekKey, labelDate, labelRange,
  fromKey, toKey, diffDays, dowOf, DOW_SHORT, DOW_LONG, MONTH_LONG,
  formatDuration, endTime, timeToMin, pad,
} from "./organizer/dates.js";
import { parseInput, describeRepeat, norm } from "./organizer/parse.js";
import { occursOn, isDone, sortTasks, tasksForDay } from "./organizer/recurrence.js";
import { CSS } from "./organizer/styles.js";
import { Icon } from "./organizer/icons.jsx";

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

// Cores do sistema da Apple. Aparecem puras so na marca da lista e na
// barrinha do compromisso; no fundo do bloco entram diluidas.
const LIST_PALETTE = [
  "#007aff", "#af52de", "#34c759", "#ff9500",
  "#ff2d55", "#5856d6", "#30b0c7", "#ffcc00",
];

const DEFAULT_LISTS = [
  { id: "pessoal", name: "Pessoal", color: "#007aff" },
  { id: "trabalho", name: "Trabalho", color: "#af52de" },
  { id: "saude", name: "Saúde", color: "#34c759" },
  { id: "estudos", name: "Estudos", color: "#ff9500" },
];

const PRIORITY_LABEL = ["Nenhuma", "Baixa", "Média", "Alta"];
const NEUTRAL = "#8a8a90";

const rgbOf = (hex) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

// No tema escuro a Apple usa variantes mais luminosas das cores de sistema.
// Sem isso, laranja diluido sobre cinza escuro vira marrom.
function listColor(hex, theme) {
  if (theme !== "dark") return hex;
  const lifted = rgbOf(hex).map((c) => Math.round(c + (255 - c) * 0.2));
  return "#" + lifted.map((c) => c.toString(16).padStart(2, "0")).join("");
}

// Bloco de compromisso, como no Calendar: fundo com a cor bem diluida e o
// TEXTO na mesma cor — clara no escuro, escura no claro. E o texto colorido
// que faz o bloco ler como "laranja" em vez de "marrom".
function tint(hex, theme) {
  const [r, g, b] = rgbOf(listColor(hex, theme));
  return `rgba(${r},${g},${b},${theme === "light" ? 0.14 : 0.16})`;
}

function blockText(hex, theme) {
  const f = theme === "dark" ? (c) => c + (255 - c) * 0.55 : (c) => c * 0.48;
  return "#" + rgbOf(hex).map((c) => Math.round(f(c)).toString(16).padStart(2, "0")).join("");
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || uid();

/* ------------------------------------------------------------------ */
/* Item: compromisso (tem hora) x tarefa (nao tem)                     */
/* ------------------------------------------------------------------ */

function TaskItem({ task, dateKey, list, theme, showList, onToggle, onOpen, onDragStart, onDragEnd, dragging }) {
  const done = isDone(task, dateKey);
  const overdue = !done && task.date && !task.repeat && task.date < todayKey();
  // Com hora vira bloco de calendario; sem hora, linha de lista.
  const isEvent = !!task.time;
  const color = listColor(list?.color ?? NEUTRAL, theme);

  return (
    <div
      className={[
        "item", isEvent ? "event" : "todo",
        done ? "done" : "", dragging ? "dragging" : "",
      ].join(" ").trim()}
      style={isEvent ? { "--tint": tint(color, theme), "--evt-text": blockText(color, theme) } : undefined}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={(e) => { if (!e.target.closest(".circle")) onOpen(task, dateKey); }}
    >
      <button
        className="circle"
        title={done ? "Marcar como não concluída" : "Concluir"}
        onClick={(e) => { e.stopPropagation(); onToggle(task, dateKey); }}
      >
        <Icon name="check" size={11} />
      </button>

      <div className="body">
        <div className="title">
          {task.priority > 0 && (
            <span className="bang" title={`Prioridade ${PRIORITY_LABEL[task.priority].toLowerCase()}`}>
              {"!".repeat(task.priority)}
            </span>
          )}
          {task.title}
        </div>

        <div className="sub">
          {isEvent && (
            <span>{task.time}{task.duration ? ` – ${endTime(task.time, task.duration)}` : ""}</span>
          )}
          {!isEvent && task.duration ? <span>{formatDuration(task.duration)}</span> : null}
          {task.repeat && (
            <span className="gi" title={`Repete ${describeRepeat(task.repeat)}`}>
              <Icon name="repeat" size={11} />
            </span>
          )}
          {overdue && <span className="late">Atrasada</span>}
          {showList && list && <span className="listname">{list.name}</span>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Campo de captura                                                    */
/* ------------------------------------------------------------------ */

function Composer({ inputRef, value, onChange, onSubmit, preview, lists }) {
  const [focused, setFocused] = useState(false);
  const known = preview?.list ? lists.find((l) => norm(l.name) === norm(preview.list)) : null;
  const has = value.trim().length > 0;

  // Leitura do que foi entendido, em texto corrido — nao em etiquetas coloridas.
  const parts = [];
  if (preview) {
    if (preview.date) parts.push(labelDate(preview.date));
    if (preview.time) parts.push(preview.time);
    if (preview.duration) parts.push(formatDuration(preview.duration));
    if (preview.repeat) parts.push(`repete ${describeRepeat(preview.repeat)}`);
    if (preview.priority > 0) parts.push(`prioridade ${PRIORITY_LABEL[preview.priority].toLowerCase()}`);
    if (preview.list) parts.push(known ? known.name : `${preview.list} (lista nova)`);
    if (!preview.date) parts.push("sem data");
  }

  return (
    <div className={`composer${focused ? " focus" : ""}`}>
      <div className="row">
        <span className="gi"><Icon name="plus" size={16} /></span>
        <input
          ref={inputRef}
          value={value}
          placeholder="Nova tarefa"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
        />
        {has && <button className="addbtn" onClick={onSubmit}>Adicionar</button>}
      </div>

      {has && preview && (
        <div className="readout">
          <b>{preview.title || "sem título"}</b>
          {parts.map((p, i) => (
            <span key={i}><span className="sep"> · </span><span className="k">{p}</span></span>
          ))}
        </div>
      )}

      {!has && focused && (
        <div className="syntax">
          <code>amanhã</code><code>sexta 15h</code><code>dia 15</code><code>23/10</code>
          <code>toda segunda e quarta</code><code>dias úteis</code><code>todo mês</code>
          <code>por 45min</code><code>!!</code><code>#lista</code>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Semana                                                              */
/* ------------------------------------------------------------------ */

function WeekView({ days, tasks, lists, showDone, theme, drag, ...h }) {
  const t = todayKey();
  return (
    <div className="weekgrid">
      {days.map((key) => {
        const all = tasksForDay(tasks, key);
        const items = showDone ? all : all.filter((x) => !isDone(x, key));
        // Quanto do dia ja esta comprometido, em texto — sem barra decorativa.
        const load = all.reduce((sum, x) => sum + (isDone(x, key) ? 0 : x.duration ?? 0), 0);
        return (
          <div
            key={key}
            className={[
              "daycol",
              key === t ? "today" : "", key < t ? "past" : "",
              drag.over === key ? "over" : "", items.length === 0 ? "vazio" : "",
            ].join(" ").trim()}
            onDragOver={(e) => { e.preventDefault(); drag.setOver(key); }}
            onDragLeave={() => drag.over === key && drag.setOver(null)}
            onDrop={(e) => { e.preventDefault(); h.onDrop(key); }}
          >
            <div className="dayhead">
              <span className="dw">{DOW_SHORT[dowOf(key)]}</span>
              <span className="dn">{fromKey(key).getDate()}</span>
              {load > 0 && <span className="hrs">{formatDuration(load)}</span>}
            </div>
            {items.length === 0
              ? <div className="none">Livre</div>
              : items.map((task) => (
                  <TaskItem key={task.id} task={task} dateKey={key} theme={theme}
                    list={lists.find((l) => l.id === task.listId)} dragging={drag.id === task.id}
                    onToggle={h.onToggle} onOpen={h.onOpen}
                    onDragStart={h.onDragStart} onDragEnd={h.onDragEnd} />
                ))}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dia                                                                 */
/* ------------------------------------------------------------------ */

function DayView({ dayKey, tasks, lists, showDone, theme, drag, ...h }) {
  const all = tasksForDay(tasks, dayKey);
  const visible = showDone ? all : all.filter((x) => !isDone(x, dayKey));
  const untimed = visible.filter((x) => !x.time);
  const timed = visible.filter((x) => x.time);

  const hours = useMemo(() => {
    const used = timed.map((x) => Math.floor(timeToMin(x.time) / 60));
    const from = Math.min(7, ...(used.length ? used : [7]));
    const to = Math.max(21, ...(used.length ? used : [21]));
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }, [timed]);

  const now = new Date();
  const isToday = dayKey === todayKey();

  return (
    <div className="dayview">
      <div className="alldaystrip">
        <div className="lab">Sem horário</div>
        {untimed.length === 0
          ? <div className="none" style={{ padding: "0 4px 2px", fontSize: 12.5, color: "var(--label3)" }}>Nada solto neste dia</div>
          : untimed.map((task) => (
              <TaskItem key={task.id} task={task} dateKey={dayKey} theme={theme}
                list={lists.find((l) => l.id === task.listId)} dragging={drag.id === task.id}
                onToggle={h.onToggle} onOpen={h.onOpen}
                onDragStart={h.onDragStart} onDragEnd={h.onDragEnd} />
            ))}
      </div>

      <div className="timeline">
        {hours.map((hour) => {
          const slotKey = `${dayKey}@${pad(hour)}`;
          const inSlot = timed.filter((x) => Math.floor(timeToMin(x.time) / 60) === hour);
          const showNow = isToday && now.getHours() === hour;
          return (
            <div key={hour} style={{ display: "contents" }}>
              <div className={`trow h${showNow ? " now" : ""}`}>{pad(hour)}:00</div>
              <div
                className={`trow s${drag.over === slotKey ? " over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); drag.setOver(slotKey); }}
                onDragLeave={() => drag.over === slotKey && drag.setOver(null)}
                onDrop={(e) => { e.preventDefault(); h.onDropTime(dayKey, `${pad(hour)}:00`); }}
              >
                {showNow && <div className="nowline" style={{ top: `${(now.getMinutes() / 60) * 100}%` }} />}
                {inSlot.map((task) => (
                  <TaskItem key={task.id} task={task} dateKey={dayKey} theme={theme}
                    list={lists.find((l) => l.id === task.listId)} dragging={drag.id === task.id}
                    onToggle={h.onToggle} onOpen={h.onOpen}
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
/* Lista                                                               */
/* ------------------------------------------------------------------ */

function ListView({ groups, lists, theme, drag, ...h }) {
  if (groups.every((g) => g.items.length === 0)) {
    return <div style={{ padding: 60, textAlign: "center", color: "var(--label3)", fontSize: 13.5 }}>Nada por aqui.</div>;
  }
  return (
    <div>
      {groups.map((g) =>
        g.items.length === 0 ? null : (
          <div className="section" key={g.key}>
            <div className={`sectionhead${g.alert ? " alert" : ""}`}>
              <h2>{g.label}</h2>
              <span className="cnt">{g.items.length}</span>
            </div>
            <div className="rows">
              {g.items.map(({ task, dateKey }) => (
                <TaskItem key={`${task.id}-${dateKey ?? "x"}`} task={task} dateKey={dateKey} theme={theme}
                  list={lists.find((l) => l.id === task.listId)} showList dragging={drag.id === task.id}
                  onToggle={h.onToggle} onOpen={h.onOpen}
                  onDragStart={h.onDragStart} onDragEnd={h.onDragEnd} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Folha de edicao                                                     */
/* ------------------------------------------------------------------ */

function TaskSheet({ task, lists, onSave, onDelete, onSkip, onClose }) {
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
      <div className="sheet">
        <h3>Editar tarefa</h3>

        <div className="row2">
          <input className="field" autoFocus value={draft.title} placeholder="Título"
            onChange={(e) => set({ title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onSave(draft)} />
        </div>

        <div className="row2">
          <textarea className="field" value={draft.notes ?? ""} placeholder="Notas"
            onChange={(e) => set({ notes: e.target.value })} />
        </div>

        <div className="row2 three">
          <div>
            <label>Data</label>
            <input className="field" type="date" value={draft.date ?? ""}
              onChange={(e) => set({ date: e.target.value || null })} />
          </div>
          <div>
            <label>Hora</label>
            <input className="field" type="time" value={draft.time ?? ""}
              onChange={(e) => set({ time: e.target.value || null })} />
          </div>
          <div>
            <label>Duração (min)</label>
            <input className="field" type="number" min="0" step="5" value={draft.duration ?? ""}
              onChange={(e) => set({ duration: e.target.value ? Number(e.target.value) : null })} />
          </div>
        </div>

        <div className="row2">
          <label>Prioridade</label>
          <div className="choices">
            {PRIORITY_LABEL.map((lbl, i) => (
              <button key={i} className={draft.priority === i ? "on" : ""} onClick={() => set({ priority: i })}>
                {i > 0 ? `${"!".repeat(i)} ${lbl}` : lbl}
              </button>
            ))}
          </div>
        </div>

        <div className="row2">
          <label>Lista</label>
          <select className="field" value={draft.listId ?? ""} onChange={(e) => set({ listId: e.target.value || null })}>
            <option value="">Sem lista</option>
            {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div className="row2">
          <label>Repetir</label>
          <div className="choices">
            {[["none", "Nunca"], ["daily", "Diária"], ["weekdays", "Dias úteis"], ["weekly", "Semanal"], ["monthly", "Mensal"]].map(([f, lbl]) => (
              <button key={f} className={freq === f ? "on" : ""} onClick={() => setFreq(f)}>{lbl}</button>
            ))}
          </div>
        </div>

        {freq === "weekly" && (
          <div className="row2">
            <label>Dias da semana</label>
            <div className="choices">
              {DOW_SHORT.map((d, i) => (
                <button key={i} className={draft.repeat?.days?.includes(i) ? "on" : ""} onClick={() => toggleDow(i)}>{d}</button>
              ))}
            </div>
          </div>
        )}

        {freq !== "none" && freq !== "weekdays" && (
          <div className="row2 two">
            <div>
              <label>A cada</label>
              <input className="field" type="number" min="1" value={draft.repeat?.interval ?? 1}
                onChange={(e) => set({ repeat: { ...draft.repeat, interval: Math.max(1, Number(e.target.value) || 1) } })} />
            </div>
            <div>
              <label>Até (opcional)</label>
              <input className="field" type="date" value={draft.repeat?.until ?? ""}
                onChange={(e) => set({ repeat: { ...draft.repeat, until: e.target.value || null } })} />
            </div>
          </div>
        )}

        {task.repeat && task._dateKey && (
          <button className="btn wide" onClick={() => onSkip(task, task._dateKey)}>
            Pular só em {labelDate(task._dateKey)}
          </button>
        )}

        <div className="actions">
          <button className="btn primary" onClick={() => onSave(draft)}>Salvar</button>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn destructive" onClick={() => onDelete(task.id)}>
            {task.repeat ? "Excluir série" : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timer de foco                                                       */
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
    return (
      <button className="fab" title="Timer de foco" onClick={() => setState((s) => ({ ...s, open: true }))}>
        <Icon name="timer" size={19} />
      </button>
    );
  }

  return (
    <div className={`timer${state.running ? " run" : ""}`}>
      <div className="lab">{state.mode === "work" ? "Foco" : "Pausa"}</div>
      <div className="clock">{pad(Math.floor(state.left / 60))}:{pad(state.left % 60)}</div>
      <div className="who">{taskTitle || `${state.rounds} ciclo${state.rounds === 1 ? "" : "s"} hoje`}</div>
      <div className="btns">
        <button className="btn primary" onClick={() => setState((s) => ({ ...s, running: !s.running }))}>
          {state.running ? "Pausar" : "Iniciar"}
        </button>
        <button className="btn" onClick={() => setState((s) => ({ ...s, running: false, left: s.mode === "work" ? WORK_SECS : BREAK_SECS }))}>
          Zerar
        </button>
        <button className="btn" title="Fechar" onClick={() => setState((s) => ({ ...s, open: false, running: false }))}>
          <Icon name="close" size={14} />
        </button>
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
    if (meta) meta.setAttribute("content", theme === "dark" ? "#1c1c1e" : "#ffffff");
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
    if (overdue.length) groups.push({ key: "atrasadas", label: "Atrasadas", alert: true, items: overdue });

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

  const anchorDate = fromKey(anchor);
  const headTitle =
    view === "semana" ? labelRange(days) :
    view === "hoje" || view === "dia"
      ? `${anchorDate.getDate()} de ${MONTH_LONG[anchorDate.getMonth()]}` :
    view === "proximos" ? "Próximos 7 dias" :
    view === "concluidas" ? "Concluídas" : "Todas as tarefas";

  const headSub =
    view === "semana" ? `${weekStats.done} de ${weekStats.total} concluídas`
      : view === "hoje" || view === "dia" ? DOW_LONG[dowOf(anchor)]
      : `${counts.today} para hoje${counts.overdue ? ` · ${counts.overdue} atrasada${counts.overdue > 1 ? "s" : ""}` : ""}`;

  const focusTask = tasks.find((t) => t.id === focus.taskId);
  const showStepper = view === "semana" || view === "hoje" || view === "dia";

  const NAV = [
    ["hoje", "Hoje", "today", counts.today],
    ["semana", "Semana", "week", null],
    ["proximos", "Próximos 7", "upcoming", counts.next7],
    ["tudo", "Todas", "list", null],
    ["concluidas", "Concluídas", "done", null],
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <b>Semana</b>
            <span>{DOW_LONG[dowOf(todayKey())]}, {fromKey(todayKey()).getDate()} de {MONTH_LONG[fromKey(todayKey()).getMonth()]}</span>
          </div>

          <div className="navsec">
            <h2>Visões</h2>
            <div className="group">
              {NAV.map(([id, label, icon, count]) => (
                <button key={id} className={`navitem${view === id ? " on" : ""}`}
                  onClick={() => { setView(id); if (id === "hoje") setAnchor(todayKey()); }}>
                  <span className="gi"><Icon name={icon} /></span>
                  {label}
                  {count ? <span className="cnt">{count}</span> : null}
                </button>
              ))}
              {counts.overdue > 0 && (
                <button className="navitem" onClick={() => setView("proximos")}>
                  <span className="gi" style={{ color: "var(--red)" }}><Icon name="overdue" /></span>
                  Atrasadas
                  <span className="cnt" style={{ color: "var(--red)" }}>{counts.overdue}</span>
                </button>
              )}
            </div>
          </div>

          <div className="navsec">
            <h2>Minhas listas</h2>
            <div className="group">
              <button className={`navitem${filterList === null ? " on" : ""}`} onClick={() => setFilterList(null)}>
                <span className="swatch" style={{ background: NEUTRAL }} />
                Todas
              </button>
              {lists.map((l) => (
                <button key={l.id} className={`navitem${filterList === l.id ? " on" : ""}`}
                  onClick={() => setFilterList(filterList === l.id ? null : l.id)}>
                  <span className="swatch" style={{ background: listColor(l.color, theme) }} />
                  {l.name}
                  {counts.byList[l.id] ? <span className="cnt">{counts.byList[l.id]}</span> : null}
                </button>
              ))}
              <button className="navitem add" onClick={addList}>
                <span className="gi"><Icon name="plus" /></span> Nova lista
              </button>
            </div>
          </div>

          <div className="foot">
            <div className="iconbar">
              <button className="iconbtn" title={theme === "dark" ? "Tema claro" : "Tema escuro"}
                onClick={() => setPrefs((p) => ({ ...p, theme: theme === "dark" ? "light" : "dark" }))}>
                <Icon name={theme === "dark" ? "sun" : "moon"} />
              </button>
              <button className={`iconbtn${prefs.showDone ? " on" : ""}`}
                title={prefs.showDone ? "Ocultar concluídas" : "Mostrar concluídas"}
                onClick={() => setPrefs((p) => ({ ...p, showDone: !p.showDone }))}>
                <Icon name="done" />
              </button>
              <button className="iconbtn" title="Exportar JSON" onClick={exportJSON}><Icon name="export" /></button>
              <button className="iconbtn" title="Importar JSON" onClick={() => fileRef.current?.click()}><Icon name="import" /></button>
              {"Notification" in window && Notification.permission === "default" && (
                <button className="iconbtn" title="Ativar lembretes (só com a aba aberta)"
                  onClick={() => Notification.requestPermission()}><Icon name="bell" /></button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importJSON(f); e.target.value = ""; }} />
            <p className="disclaimer">Dados só neste navegador.<br />Lembretes só com a aba aberta.</p>
          </div>
        </aside>

        <main className="main">
          <header className="toolbar">
            <div className="titleblock">
              <h1>{headTitle}</h1>
              <p>{headSub}</p>
            </div>

            <div className="grow" />

            <div className="tools">
              {showStepper && (
                <div className="stepper">
                  <button title="Anterior" onClick={() => setAnchor(addDaysKey(anchor, view === "semana" ? -7 : -1))}>
                    <Icon name="left" size={15} />
                  </button>
                  <button className="today" onClick={() => setAnchor(todayKey())}>Hoje</button>
                  <button title="Próximo" onClick={() => setAnchor(addDaysKey(anchor, view === "semana" ? 7 : 1))}>
                    <Icon name="right" size={15} />
                  </button>
                </div>
              )}

              <div className="segmented">
                {[["hoje", "Dia"], ["semana", "Semana"], ["proximos", "Lista"]].map(([id, lbl]) => (
                  <button key={id} className={view === id ? "on" : ""} onClick={() => setView(id)}>{lbl}</button>
                ))}
              </div>

              <div className="searchbox">
                <Icon name="search" size={14} />
                <input placeholder="Buscar" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
          </header>

          <Composer inputRef={inputRef} value={input} onChange={setInput} onSubmit={addTask}
            preview={preview} lists={lists} />

          <div className="content">
            {view === "semana" && (
              <div className="weekwrap">
                <WeekView days={days} tasks={visibleTasks} lists={lists} showDone={prefs.showDone}
                  theme={theme} drag={dragCtx} {...handlers} />
                <div className={`unscheduled${prefs.showBacklog === false ? " closed" : ""}${dragOver === "backlog" ? " over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver("backlog"); }}
                  onDragLeave={() => dragOver === "backlog" && setDragOver(null)}
                  onDrop={(e) => { e.preventDefault(); moveTask(null); }}>
                  <div className="uhead">
                    {prefs.showBacklog !== false && <span>Sem data</span>}
                    <span className="cnt">{backlog.length}</span>
                    <button title={prefs.showBacklog === false ? "Abrir" : "Recolher"}
                      onClick={() => setPrefs((p) => ({ ...p, showBacklog: p.showBacklog === false }))}>
                      <Icon name={prefs.showBacklog === false ? "left" : "right"} size={14} />
                    </button>
                  </div>
                  {prefs.showBacklog !== false && (
                    backlog.length === 0
                      ? <div className="none">Arraste aqui para tirar do calendário</div>
                      : backlog.map((task) => (
                          <TaskItem key={task.id} task={task} dateKey={null} theme={theme}
                            list={lists.find((l) => l.id === task.listId)} dragging={dragId === task.id}
                            onToggle={toggleTask} onOpen={handlers.onOpen}
                            onDragStart={handlers.onDragStart} onDragEnd={handlers.onDragEnd} />
                        ))
                  )}
                </div>
              </div>
            )}

            {(view === "hoje" || view === "dia") && (
              <DayView dayKey={anchor} tasks={visibleTasks} lists={lists} showDone={prefs.showDone}
                theme={theme} drag={dragCtx} {...handlers} />
            )}

            {(view === "proximos" || view === "tudo" || view === "concluidas") && (
              <ListView groups={listGroups} lists={lists} theme={theme} drag={dragCtx} {...handlers} />
            )}
          </div>
        </main>
      </div>

      {editing && (
        <TaskSheet task={editing} lists={lists} onSave={saveTask} onDelete={deleteTask}
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
