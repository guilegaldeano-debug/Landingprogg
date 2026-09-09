// Parser de entrada rapida em pt-BR.
// "reuniao com joao amanha as 14h30 por 1h !! #trabalho"
//   -> { title:"reuniao com joao", date:"...", time:"14:30", duration:60, priority:2, list:"trabalho" }
//
// Estrategia: normaliza acentos preservando o tamanho da string (mapa 1:1),
// roda os regexes na copia normalizada, marca os trechos consumidos e monta
// o titulo com o que sobrou do texto ORIGINAL.

import { todayKey, addDaysKey, nextDow, dowOf, fromKey, toKey, pad } from "./dates.js";

const ACCENT_MAP = {
  "á":"a","à":"a","ã":"a","â":"a","ä":"a","é":"e","ê":"e","è":"e","ë":"e",
  "í":"i","ì":"i","î":"i","ï":"i","ó":"o","ô":"o","õ":"o","ò":"o","ö":"o",
  "ú":"u","ù":"u","û":"u","ü":"u","ç":"c","ñ":"n",
};

// Substitui 1 caractere por 1 caractere: os indices continuam validos no original.
export function norm(s) {
  return s.toLowerCase().replace(/[^\x00-\x7F]/g, (c) => ACCENT_MAP[c] ?? c);
}

const DOW_NAMES = {
  domingo: 0, segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6,
  dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6,
};

const MONTH_NAMES = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6, julho: 7,
  agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

const DOW_RE = "segunda|terca|quarta|quinta|sexta|sabado|domingo";

function dowFromWord(word) {
  const clean = word.replace(/-?feiras?$/, "").replace(/s$/, "").trim();
  return DOW_NAMES[clean];
}

export function parseInput(raw, refKey = todayKey()) {
  const text = raw ?? "";
  const n = norm(text);
  const used = new Array(text.length).fill(false);

  const free = (a, b) => { for (let i = a; i < b; i++) if (used[i]) return false; return true; };
  const mark = (a, b) => { for (let i = a; i < b; i++) used[i] = true; };

  // Roda um regex global sobre a string normalizada, ignorando trechos ja consumidos.
  // O callback devolve false para recusar o match (ex.: hora invalida).
  function scan(re, cb) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(n)) !== null) {
      const a = m.index;
      const b = a + m[0].length;
      if (m[0].length === 0) { re.lastIndex++; continue; }
      if (free(a, b) && cb(m, a, b) !== false) { mark(a, b); return true; }
    }
    return false;
  }

  const out = {
    title: "", date: null, time: null, duration: null,
    priority: 0, repeat: null, list: null,
  };

  // ---------- 1. Recorrencia (antes das datas: "toda segunda" contem "segunda") ----------
  scan(/\bcada\s+(\d{1,2})\s*(dias?|semanas?|meses|mes)\b/g, (m) => {
    const k = Number(m[1]);
    if (k < 1) return false;
    const unit = m[2];
    out.repeat = {
      freq: unit.startsWith("dia") ? "daily" : unit.startsWith("semana") ? "weekly" : "monthly",
      interval: k,
    };
  });

  if (!out.repeat) {
    scan(/\b(?:todos?\s+os?\s+)?dias\s+uteis\b|\bem\s+dias\s+uteis\b|\btodo\s+dia\s+util\b/g, () => {
      out.repeat = { freq: "weekdays", interval: 1 };
    });
  }

  if (!out.repeat) {
    const rep = new RegExp(
      `\\b(?:toda|todo|todas\\s+as|todos\\s+os)\\s+((?:${DOW_RE})(?:-?feiras?)?s?(?:\\s*(?:,|e)\\s*(?:${DOW_RE})(?:-?feiras?)?s?)*)\\b`,
      "g"
    );
    scan(rep, (m) => {
      const days = m[1]
        .split(/\s*(?:,|\se\s)\s*/)
        .map((w) => dowFromWord(w.trim()))
        .filter((d) => d !== undefined);
      if (!days.length) return false;
      out.repeat = { freq: "weekly", interval: 1, days: [...new Set(days)].sort() };
    });
  }

  if (!out.repeat) {
    scan(/\b(todo\s+dia|todos\s+os\s+dias|diariamente)\b/g, () => {
      out.repeat = { freq: "daily", interval: 1 };
    });
  }
  if (!out.repeat) {
    scan(/\b(toda\s+semana|semanalmente|toda\s+quinzena)\b/g, (m) => {
      out.repeat = { freq: "weekly", interval: m[1] === "toda quinzena" ? 2 : 1 };
    });
  }
  if (!out.repeat) {
    scan(/\b(todo\s+mes|mensalmente)\b/g, () => {
      out.repeat = { freq: "monthly", interval: 1 };
    });
  }

  // ---------- 2. Data ----------
  // dd/mm[/aaaa]
  scan(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g, (m) => {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    if (d < 1 || d > 31 || mo < 1 || mo > 12) return false;
    let y = m[3] ? Number(m[3]) : fromKey(refKey).getFullYear();
    if (y < 100) y += 2000;
    const key = `${y}-${pad(mo)}-${pad(d)}`;
    // Sem ano explicito e ja passou -> assume o ano que vem.
    out.date = !m[3] && key < refKey ? `${y + 1}-${pad(mo)}-${pad(d)}` : key;
  });

  // "15 de marco" / "15 de mar"
  if (!out.date) {
    const monthRe = new RegExp(`\\b(\\d{1,2})\\s+de\\s+(${Object.keys(MONTH_NAMES).join("|")})\\b`, "g");
    scan(monthRe, (m) => {
      const d = Number(m[1]);
      const mo = MONTH_NAMES[m[2]];
      if (d < 1 || d > 31) return false;
      const y = fromKey(refKey).getFullYear();
      const key = `${y}-${pad(mo)}-${pad(d)}`;
      out.date = key < refKey ? `${y + 1}-${pad(mo)}-${pad(d)}` : key;
    });
  }

  // "dia 15" -> proxima ocorrencia desse dia do mes
  if (!out.date) {
    scan(/\b(?:no\s+)?dia\s+(\d{1,2})\b/g, (m) => {
      const d = Number(m[1]);
      if (d < 1 || d > 31) return false;
      const ref = fromKey(refKey);
      let y = ref.getFullYear();
      let mo = ref.getMonth() + 1;
      if (d < ref.getDate()) { mo += 1; if (mo > 12) { mo = 1; y += 1; } }
      out.date = `${y}-${pad(mo)}-${pad(d)}`;
    });
  }

  if (!out.date) scan(/\bdepois\s+de\s+amanha\b/g, () => { out.date = addDaysKey(refKey, 2); });
  if (!out.date) scan(/\bamanha\b/g, () => { out.date = addDaysKey(refKey, 1); });
  if (!out.date) scan(/\bhoje\b/g, () => { out.date = refKey; });
  if (!out.date) scan(/\bontem\b/g, () => { out.date = addDaysKey(refKey, -1); });
  if (!out.date) scan(/\b(?:daqui\s+a|em)\s+(\d{1,3})\s+dias?\b/g, (m) => { out.date = addDaysKey(refKey, Number(m[1])); });
  if (!out.date) scan(/\b(?:daqui\s+a|em)\s+(\d{1,2})\s+semanas?\b/g, (m) => { out.date = addDaysKey(refKey, Number(m[1]) * 7); });

  // Dia da semana solto: "sexta", "na sexta", "proxima sexta", "sexta que vem"
  if (!out.date) {
    const dowRe = new RegExp(
      `\\b(proxima|proximo|na|no|nesta|neste|essa|esta|esse|este)?\\s*(${DOW_RE})(?:-?feira)?\\b(\\s+que\\s+vem)?`,
      "g"
    );
    scan(dowRe, (m) => {
      const dow = dowFromWord(m[2]);
      if (dow === undefined) return false;
      const forceNext = /^prox/.test(m[1] || "") || !!m[3];
      out.date = nextDow(dow, refKey, forceNext);
    });
  }

  // Recorrencia semanal sem data explicita ancora no proximo dia da semana da regra.
  if (!out.date && out.repeat?.freq === "weekly" && out.repeat.days?.length) {
    out.date = out.repeat.days
      .map((d) => nextDow(d, refKey))
      .sort()[0];
  }
  if (!out.date && out.repeat) out.date = refKey;

  // ---------- 3. Duracao com preposicao (antes da hora: "por 2h") ----------
  scan(/\b(?:por|durante|dura)\s+(\d{1,2})\s*(?:h|horas?)\s*(\d{2})?\b/g, (m) => {
    out.duration = Number(m[1]) * 60 + (m[2] ? Number(m[2]) : 0);
  });
  if (out.duration == null) {
    scan(/\b(?:por|durante|dura)\s+(\d{1,3})\s*(?:min|minutos?)\b/g, (m) => {
      out.duration = Number(m[1]);
    });
  }

  // ---------- 4. Hora ----------
  scan(/\bmeio[\s-]?dia\b/g, () => { out.time = "12:00"; });
  if (!out.time) scan(/\bmeia[\s-]?noite\b/g, () => { out.time = "00:00"; });
  if (!out.time) {
    scan(/(?:\b(?:as|ao?s|@|a\s+partir\s+das?)\s*)?\b(\d{1,2})\s*[h:]\s*(\d{2})\b/g, (m) => {
      const h = Number(m[1]);
      const mi = Number(m[2]);
      if (h > 23 || mi > 59) return false;
      out.time = `${pad(h)}:${pad(mi)}`;
    });
  }
  if (!out.time) {
    scan(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/g, (m) => {
      let h = Number(m[1]);
      const mi = m[2] ? Number(m[2]) : 0;
      if (h > 12 || mi > 59) return false;
      if (m[3] === "pm" && h < 12) h += 12;
      if (m[3] === "am" && h === 12) h = 0;
      out.time = `${pad(h)}:${pad(mi)}`;
    });
  }
  if (!out.time) {
    scan(/(?:\b(?:as|ao?s|@)\s*)?\b(\d{1,2})\s*h\b/g, (m) => {
      const h = Number(m[1]);
      if (h > 23) return false;
      out.time = `${pad(h)}:00`;
    });
  }
  if (!out.time) {
    scan(/\b(?:as|ao?s|@)\s*(\d{1,2})\b/g, (m) => {
      const h = Number(m[1]);
      if (h > 23) return false;
      out.time = `${pad(h)}:00`;
    });
  }

  // ---------- 5. Duracao solta ----------
  if (out.duration == null) {
    scan(/\b(\d{1,3})\s*(?:min|minutos?)\b/g, (m) => { out.duration = Number(m[1]); });
  }
  if (out.duration == null) {
    scan(/\b(\d{1,2})\s*horas?\b/g, (m) => { out.duration = Number(m[1]) * 60; });
  }

  // ---------- 6. Prioridade ----------
  scan(/(^|\s)(!{1,3})(?=\s|$)/g, (m, a) => {
    out.priority = m[2].length;
    mark(a, a + m[0].length);
  });
  if (!out.priority) {
    scan(/\bp([1-3])\b/g, (m) => { out.priority = 4 - Number(m[1]); });
  }
  if (!out.priority) {
    scan(/\b(urgente|prioridade\s+alta)\b/g, () => { out.priority = 3; });
  }

  // ---------- 7. Lista (#tag) ----------
  scan(/#([\p{L}\d_-]+)/gu, (m) => { out.list = m[1]; });

  // ---------- 8. Titulo = sobras do texto original ----------
  let title = "";
  for (let i = 0; i < text.length; i++) if (!used[i]) title += text[i];
  title = title.replace(/\s+/g, " ").trim();
  // Limpa conectores orfaos nas pontas ("reuniao com o joao no" -> "reuniao com o joao")
  const junk = /^(?:de|da|do|em|no|na|as|a|o|e|para|pra|ate|que|vem|feira|-)$/i;
  let parts = title.split(" ").filter(Boolean);
  while (parts.length && junk.test(norm(parts[parts.length - 1]))) parts.pop();
  while (parts.length && junk.test(norm(parts[0]))) parts.shift();
  out.title = parts.join(" ").replace(/\s+([,.;:])/g, "$1").trim();

  return out;
}

// Resumo legivel do que o parser entendeu (usado no preview do input).
export function describeRepeat(repeat) {
  if (!repeat) return "";
  const { freq, interval = 1, days } = repeat;
  if (freq === "daily") return interval === 1 ? "todo dia" : `a cada ${interval} dias`;
  if (freq === "weekdays") return "dias úteis";
  if (freq === "monthly") return interval === 1 ? "todo mês" : `a cada ${interval} meses`;
  if (freq === "weekly") {
    const names = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    const base = days?.length ? days.map((d) => names[d]).join("/") : "semanal";
    return interval === 1 ? base : `${base} · a cada ${interval} sem`;
  }
  return "";
}
