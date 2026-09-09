// Helpers de data. Chave canonica = "YYYY-MM-DD" no fuso local.
// Toda aritmetica de dias e feita sobre a chave (via Date.UTC) para nao sofrer com DST.

export const DOW_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const DOW_LONG = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const MONTH_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
export const MONTH_LONG = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export const pad = (n) => String(n).padStart(2, "0");

export function toKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey() {
  return toKey(new Date());
}

export function addDaysKey(key, n) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function addMonthsKey(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  const base = new Date(y, m - 1 + n, 1);
  const dim = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  base.setDate(Math.min(d, dim));
  return toKey(base);
}

export function diffDays(aKey, bKey) {
  const [ay, am, ad] = aKey.split("-").map(Number);
  const [by, bm, bd] = bKey.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

export function dowOf(key) {
  return fromKey(key).getDay();
}

// Segunda-feira como inicio da semana.
export function startOfWeekKey(key) {
  const dow = dowOf(key);
  const back = (dow + 6) % 7;
  return addDaysKey(key, -back);
}

export function weekKeys(anchorKey) {
  const start = startOfWeekKey(anchorKey);
  return Array.from({ length: 7 }, (_, i) => addDaysKey(start, i));
}

export function daysInMonthOf(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

// Proxima ocorrencia de um dia da semana a partir de hoje (inclui hoje).
export function nextDow(dow, fromKeyStr = todayKey(), forceNextWeek = false) {
  const cur = dowOf(fromKeyStr);
  let delta = (dow - cur + 7) % 7;
  // "proxima sexta" / "sexta que vem": so pula a semana quando hoje JA e esse dia.
  if (forceNextWeek && delta === 0) delta = 7;
  return addDaysKey(fromKeyStr, delta);
}

export function labelDate(key) {
  if (!key) return "Sem data";
  const t = todayKey();
  const d = diffDays(t, key);
  if (d === 0) return "Hoje";
  if (d === 1) return "Amanhã";
  if (d === -1) return "Ontem";
  const dt = fromKey(key);
  const sameYear = dt.getFullYear() === new Date().getFullYear();
  const base = `${DOW_SHORT[dt.getDay()]}, ${dt.getDate()} ${MONTH_SHORT[dt.getMonth()]}`;
  return sameYear ? base : `${base} ${dt.getFullYear()}`;
}

export function labelRange(keys) {
  const a = fromKey(keys[0]);
  const b = fromKey(keys[keys.length - 1]);
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()} – ${b.getDate()} de ${MONTH_LONG[a.getMonth()]} ${a.getFullYear()}`;
  }
  return `${a.getDate()} ${MONTH_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTH_SHORT[b.getMonth()]} ${b.getFullYear()}`;
}

export const timeToMin = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const minToTime = (min) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;

export function formatDuration(min) {
  if (!min) return "";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${pad(m)}` : `${h}h`;
}

export function endTime(time, duration) {
  const start = timeToMin(time);
  if (start == null || !duration) return null;
  return minToTime(start + duration);
}
