export const CSS = `
/* ============================================================
   Tokens — dois temas. O tema e aplicado como data-theme no <html>.
   Contrastes de texto verificados em WCAG AA (>= 4.5:1).
   ============================================================ */
:root{
  --bg:#0a0e17; --surface:#121826; --surface2:#1a2233; --raise:#212b3d;
  --line:#232c3f; --line2:#33405a;
  --text:#eef2f9; --muted:#9aa8c4; --dim:#8492ad;
  --accent:#3b82f6; --accent-strong:#2563eb; --accent-soft:rgba(59,130,246,.14);
  --accent-text:#8fbaff;
  --ok:#4ade80; --warn:#fbbf24; --bad:#fca5a5; --violet:#c4b5fd;
  --on-accent:#fff;
  --shadow-1:0 1px 2px rgba(0,0,0,.4);
  --shadow-2:0 10px 30px rgba(0,0,0,.5);
  --scrim:rgba(4,7,14,.72);

  --font:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  --r-xs:5px; --r-sm:7px; --r:10px; --r-lg:14px;
}
:root[data-theme="light"]{
  --bg:#f5f7fb; --surface:#fff; --surface2:#f2f5fa; --raise:#e9eef6;
  --line:#e3e8f0; --line2:#cfd8e6;
  --text:#111726; --muted:#4f5b74; --dim:#5c6880;
  --accent:#2563eb; --accent-strong:#1d4ed8; --accent-soft:rgba(37,99,235,.1);
  --accent-text:#1d4ed8;
  --ok:#15803d; --warn:#b45309; --bad:#b91c1c; --violet:#6d28d9;
  --shadow-1:0 1px 2px rgba(16,24,40,.06);
  --shadow-2:0 12px 32px rgba(16,24,40,.14);
  --scrim:rgba(17,23,38,.4);
}

*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);
  font-size:13px;line-height:1.45;-webkit-font-smoothing:antialiased}
button,input,select,textarea{font-family:inherit;font-size:inherit;color:inherit}
button{cursor:pointer;border:none;background:none}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
::selection{background:var(--accent);color:var(--on-accent)}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--line2);border-radius:10px;border:3px solid transparent;background-clip:content-box}
::-webkit-scrollbar-thumb:hover{background:var(--dim);background-clip:content-box}
.num{font-family:var(--mono);font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}

@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}

.app{display:flex;min-height:100vh}

/* ---------- sidebar ---------- */
.side{width:228px;flex:0 0 228px;background:var(--surface);border-right:1px solid var(--line);
  padding:16px 12px;display:flex;flex-direction:column;gap:20px;position:sticky;top:0;height:100vh;overflow-y:auto}
.brand{display:flex;align-items:center;gap:10px;padding:0 4px}
.brand .mark{width:30px;height:30px;border-radius:9px;background:var(--accent);color:var(--on-accent);
  display:flex;align-items:center;justify-content:center;flex:0 0 30px}
.brand .mark svg{display:block}
.brand b{font-size:14px;font-weight:600;letter-spacing:-.01em;display:block}
.brand span{display:block;font-size:11px;color:var(--dim);font-weight:400}
.sec{font-size:11px;font-weight:600;color:var(--dim);margin:0 0 6px 8px;letter-spacing:.01em}
.grp{display:flex;flex-direction:column;gap:1px}
.navbtn{display:flex;align-items:center;gap:10px;width:100%;border-radius:var(--r-sm);
  padding:7px 9px;font-size:13px;color:var(--muted);text-align:left;transition:background .12s,color .12s}
.navbtn:hover{background:var(--surface2);color:var(--text)}
.navbtn.on{background:var(--accent-soft);color:var(--text);font-weight:500}
.navbtn .ico{width:16px;text-align:center;color:var(--dim);font-size:12px;flex:0 0 16px}
.navbtn.on .ico{color:var(--accent-text)}
.navbtn .cnt{margin-left:auto;font-size:11px;color:var(--dim);font-family:var(--mono);font-variant-numeric:tabular-nums}
.navbtn.on .cnt{color:var(--accent-text)}
.dot{width:8px;height:8px;border-radius:50%;flex:0 0 8px}

.side .foot{margin-top:auto;display:flex;flex-direction:column;gap:10px}
.streak{background:var(--surface2);border-radius:var(--r);padding:10px 11px;display:flex;gap:11px}
.streak div{flex:1;min-width:0}
.streak b{display:block;font-size:17px;font-weight:600;font-family:var(--mono);font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.streak span{display:block;font-size:11px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.toolrow{display:flex;gap:2px;background:var(--surface2);border-radius:var(--r-sm);padding:3px}
.tool{flex:1;height:26px;border-radius:var(--r-xs);color:var(--dim);font-size:13px;
  display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s}
.tool:hover{background:var(--raise);color:var(--text)}
.tool.on{color:var(--accent-text);background:var(--accent-soft)}
.side .foot .toolrow{flex:0 0 auto}
.note{font-size:11px;color:var(--dim);line-height:1.5;padding:0 2px}
.ghost{border:1px solid var(--line2);border-radius:var(--r-sm);color:var(--muted);
  font-size:12px;padding:7px 12px;transition:border-color .12s,color .12s,background .12s}
.ghost:hover{border-color:var(--accent);color:var(--accent-text);background:var(--accent-soft)}

/* ---------- topo ---------- */
.main{flex:1;min-width:0;display:flex;flex-direction:column}
.top{display:flex;align-items:center;gap:12px;padding:18px 22px 0;flex-wrap:wrap}
.h1{font-size:21px;font-weight:600;margin:0;letter-spacing:-.02em;line-height:1.2}
.sub{font-size:12px;color:var(--dim);margin-top:3px}
.nav{display:flex;gap:2px;align-items:center;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r-sm);padding:2px}
.icobtn{border-radius:var(--r-xs);color:var(--muted);height:26px;min-width:26px;padding:0 6px;
  display:flex;align-items:center;justify-content:center;font-size:14px;transition:background .12s,color .12s}
.icobtn:hover{background:var(--surface2);color:var(--text)}
.icobtn.txt{font-size:12px;padding:0 10px}
.seg{display:flex;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);padding:2px;gap:2px}
.seg button{border-radius:var(--r-xs);color:var(--muted);font-size:12px;padding:5px 13px;
  transition:background .12s,color .12s}
.seg button:hover{color:var(--text)}
.seg button.on{background:var(--accent);color:var(--on-accent);font-weight:500}
.spacer{flex:1}
.search{width:180px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);
  padding:7px 11px;font-size:12px;outline:none;transition:border-color .12s}
.search:focus{border-color:var(--accent)}
.search::placeholder{color:var(--dim)}
.progress{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dim)}
.bar{width:88px;height:4px;border-radius:4px;background:var(--line);overflow:hidden}
.bar i{display:block;height:100%;background:var(--ok);transition:width .4s ease}

/* ---------- entrada rapida ---------- */
.qa{margin:16px 22px 0;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:4px 6px 4px 14px;transition:border-color .12s,box-shadow .12s}
.qa.focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.qa .row{display:flex;align-items:center;gap:10px}
.qa .plus{color:var(--dim);font-size:15px;line-height:1;flex:0 0 auto}
.qa.focus .plus{color:var(--accent-text)}
.qa input{flex:1;background:none;border:none;outline:none;font-size:14px;padding:11px 0;min-width:0}
.qa input::placeholder{color:var(--dim)}
.addbtn{background:var(--accent);border-radius:var(--r-sm);color:var(--on-accent);
  font-size:12px;font-weight:600;padding:8px 15px;white-space:nowrap;transition:opacity .12s,background .12s}
.addbtn:hover:not(:disabled){background:var(--accent-strong)}
.addbtn:disabled{background:var(--raise);color:var(--dim);cursor:default}
.chips{display:flex;gap:5px;flex-wrap:wrap;padding:0 0 10px}
.chip{font-size:11px;padding:3px 9px;border-radius:20px;background:var(--surface2);color:var(--muted);
  border:1px solid transparent;white-space:nowrap}
.chip.b{background:var(--accent-soft);color:var(--accent-text)}
.chip.v{color:var(--violet)}
.chip.a{color:var(--warn)}
.chip.r{color:var(--bad)}
.hint{font-size:11.5px;color:var(--dim);line-height:1.9;padding:0 0 10px}
.hint code{background:var(--surface2);border-radius:var(--r-xs);padding:2px 6px;color:var(--muted);
  font-family:var(--mono);font-size:11px}
.hint .ex{color:var(--muted)}

/* ---------- grade da semana ---------- */
.body{flex:1;padding:16px 22px 28px;min-width:0}
.week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;align-items:stretch}
.col{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:8px;
  min-height:clamp(150px,26vh,300px);display:flex;flex-direction:column;gap:6px;
  transition:border-color .12s,background .12s}
.col.today{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent-soft)}
.col.past{opacity:.55}
.col.past:hover{opacity:1}
.col.over{border-color:var(--accent);background:var(--accent-soft)}
.colhead{padding:2px 2px 7px;border-bottom:1px solid var(--line);margin-bottom:1px}
.colhead .line1{display:flex;align-items:baseline;gap:6px}
.colhead .dw{font-size:11px;color:var(--dim);font-weight:500}
.col.today .dw{color:var(--accent-text)}
.colhead .dn{font-size:17px;font-weight:600;font-family:var(--mono);font-variant-numeric:tabular-nums;letter-spacing:-.03em}
.col.today .dn{color:var(--accent-text)}
.colhead .n{margin-left:auto;font-size:11px;color:var(--dim);font-family:var(--mono)}
/* barra de carga: quanto do dia ja esta comprometido */
.load{height:3px;border-radius:3px;background:var(--line2);opacity:.5;margin-top:7px;overflow:hidden;display:flex}
.col.today .load{opacity:.8}
.load i{display:block;height:100%;background:var(--accent);transition:width .4s ease}
.load i.full{background:var(--warn)}
.empty{font-size:12px;color:var(--dim);text-align:center;padding:10px 4px;opacity:.5}

/* ---------- cartao de tarefa ---------- */
.task{display:flex;align-items:flex-start;gap:8px;background:var(--surface2);
  border:1px solid var(--line);border-left:3px solid var(--line2);border-radius:var(--r-sm);padding:8px 9px;cursor:grab;
  transition:background .12s,box-shadow .12s,transform .12s,opacity .12s}
.task:hover{background:var(--raise);border-color:var(--line2);box-shadow:var(--shadow-1)}
.task:active{cursor:grabbing}
.task.dragging{opacity:.3}
.task.done{opacity:.5}
.task.done .t{text-decoration:line-through;text-decoration-thickness:1px;color:var(--dim)}
.task .check{flex:0 0 16px;width:16px;height:16px;margin-top:1px;border-radius:5px;
  border:1.5px solid var(--line2);display:flex;align-items:center;justify-content:center;
  font-size:10px;color:var(--on-accent);padding:0;transition:background .14s,border-color .14s,transform .14s}
.task .check:hover{border-color:var(--ok);transform:scale(1.12)}
.task.done .check{background:var(--ok);border-color:var(--ok)}
.task .mid{min-width:0;flex:1}
.task .t{font-size:13px;line-height:1.35;overflow-wrap:break-word}
/* prioridade: ponto explicito antes do titulo. A borda esquerda e sempre a LISTA. */
.pri{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:5px;vertical-align:middle;
  position:relative;top:-1px}
.pri.p1{background:var(--accent)} .pri.p2{background:var(--warn)} .pri.p3{background:var(--bad)}
.task .meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px;font-size:11px;color:var(--dim)}
.task .time{color:var(--accent-text);font-family:var(--mono);font-variant-numeric:tabular-nums;font-size:11px}
.task .late{color:var(--bad);font-weight:500}
.task .rep{font-size:11px}

/* ---------- linha do tempo do dia ---------- */
.day{display:grid;grid-template-columns:58px 1fr;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r);overflow:hidden}
.hr{border-top:1px solid var(--line);min-height:50px;position:relative}
.hr.lbl{color:var(--dim);font-size:11px;padding:5px 10px 0 0;text-align:right;
  font-family:var(--mono);font-variant-numeric:tabular-nums}
.hr.slot{padding:5px 6px;display:flex;flex-direction:column;gap:5px;transition:background .12s}
.hr.slot:hover{background:var(--surface2)}
.hr.slot.over{background:var(--accent-soft)}
.hr.now .lbl,.hr.lbl.now{color:var(--bad)}
.nowline{position:absolute;left:0;right:0;height:2px;background:var(--bad);z-index:3;pointer-events:none}
.nowline::before{content:"";position:absolute;left:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:var(--bad)}
.untimed{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:12px;
  margin-bottom:10px;display:flex;flex-direction:column;gap:6px}

/* ---------- visao de lista ---------- */
.group{margin-bottom:20px}
.grouphead{display:flex;align-items:center;gap:9px;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:9px}
.grouphead .line{flex:1;height:1px;background:var(--line)}
.grouphead .n{font-size:11px;color:var(--dim);font-family:var(--mono)}
.collapse{color:var(--dim);font-size:13px;padding:0 3px;border-radius:var(--r-xs);transition:color .12s}
.collapse:hover{color:var(--accent-text)}
.stack{display:flex;flex-direction:column;gap:5px}

/* ---------- painel sem data ---------- */
.backlog{width:216px;flex:0 0 216px}
.backlog.closed{width:auto;flex:0 0 auto}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:10px;
  display:flex;flex-direction:column;gap:6px;min-height:140px;transition:border-color .12s,background .12s}
.panel.over{border-color:var(--accent);background:var(--accent-soft)}
.split{display:flex;gap:14px;align-items:flex-start}

/* ---------- modal ---------- */
.scrim{position:fixed;inset:0;background:var(--scrim);backdrop-filter:blur(4px);z-index:50;
  display:flex;align-items:center;justify-content:center;padding:18px;animation:fade .14s ease}
@keyframes fade{from{opacity:0}to{opacity:1}}
.modal{background:var(--surface);border:1px solid var(--line2);border-radius:var(--r-lg);padding:22px;
  width:100%;max-width:470px;max-height:88vh;overflow-y:auto;box-shadow:var(--shadow-2);animation:pop .16s ease}
@keyframes pop{from{opacity:0;transform:translateY(8px) scale(.99)}to{opacity:1;transform:none}}
.modal h3{margin:0 0 16px;font-size:15px;font-weight:600;letter-spacing:-.01em;color:var(--text)}
.field{margin-bottom:13px}
.field label{display:block;font-size:11.5px;font-weight:500;color:var(--dim);margin-bottom:5px}
.inp{width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-sm);
  color:var(--text);font-size:13px;padding:9px 11px;outline:none;transition:border-color .12s}
.inp:focus{border-color:var(--accent)}
textarea.inp{resize:vertical;min-height:66px;line-height:1.55}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px}
.pick{display:flex;gap:5px;flex-wrap:wrap}
.pick button{background:var(--surface2);border:1px solid var(--line);border-radius:var(--r-sm);
  color:var(--muted);font-size:12px;padding:7px 11px;transition:border-color .12s,background .12s,color .12s}
.pick button:hover{color:var(--text)}
.pick button.on{border-color:var(--accent);background:var(--accent-soft);color:var(--text);font-weight:500}
.modal .acts{display:flex;gap:8px;margin-top:18px}
.modal .acts .addbtn{padding:10px 16px}
.danger{border:1px solid var(--line2);color:var(--bad);border-radius:var(--r-sm);font-size:12px;padding:9px 14px;
  transition:border-color .12s,background .12s}
.danger:hover{border-color:var(--bad);background:rgba(239,68,68,.1)}

/* ---------- timer de foco ---------- */
.ftimer{position:fixed;right:20px;bottom:20px;z-index:40;background:var(--surface);border:1px solid var(--line2);
  border-radius:var(--r-lg);padding:14px 16px;min-width:206px;box-shadow:var(--shadow-2);animation:pop .16s ease}
.ftimer.run{border-color:var(--ok)}
.ftimer .lab{font-size:11px;color:var(--dim);font-weight:500}
.ftimer .clock{font-size:34px;font-weight:600;margin:2px 0 1px;font-family:var(--mono);
  font-variant-numeric:tabular-nums;letter-spacing:-.04em}
.ftimer.run .clock{color:var(--ok)}
.ftimer .task-name{font-size:11.5px;color:var(--dim);margin-bottom:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ftimer .btns{display:flex;gap:5px}
.ftimer .btns button{flex:1;font-size:12px;padding:7px 0;border-radius:var(--r-sm);
  background:var(--surface2);color:var(--muted);transition:background .12s,color .12s}
.ftimer .btns button:hover{background:var(--raise);color:var(--text)}
.ftimer .btns button.pri-btn{background:var(--accent);color:var(--on-accent);font-weight:600;flex:2}
.ftimer .btns button.pri-btn:hover{background:var(--accent-strong)}
.fab{position:fixed;right:20px;bottom:20px;z-index:40;width:44px;height:44px;border-radius:50%;
  background:var(--surface);border:1px solid var(--line2);font-size:17px;color:var(--muted);
  box-shadow:var(--shadow-2);transition:color .12s,border-color .12s}
.fab:hover{color:var(--accent-text);border-color:var(--accent)}

/* ---------- toast ---------- */
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:60;background:var(--raise);
  border:1px solid var(--line2);border-radius:var(--r);padding:10px 16px;font-size:12.5px;color:var(--text);
  box-shadow:var(--shadow-2);display:flex;align-items:center;gap:14px;max-width:min(90vw,460px);
  animation:rise .18s ease}
@keyframes rise{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
.toast span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.toast button{color:var(--accent-text);font-size:12.5px;font-weight:600;white-space:nowrap}

/* ---------- responsivo ---------- */
@media (max-width:1240px){ .backlog{flex:0 0 188px;width:188px} }
@media (max-width:980px){
  .app{flex-direction:column}
  .side{width:auto;flex:none;height:auto;position:sticky;top:0;z-index:30;flex-direction:row;align-items:center;
    overflow-x:auto;gap:10px;padding:10px 14px;border-right:none;border-bottom:1px solid var(--line)}
  .side .sec,.side .streak,.side .note,.side .brand span{display:none}
  .side .grp{flex-direction:row;gap:4px}
  .side .foot{margin:0 0 0 auto;flex-direction:row;align-items:center}
  .navbtn{width:auto;white-space:nowrap}
  .split{flex-direction:column;align-items:stretch}
  .backlog,.backlog.closed{width:100%;flex:none}
  .qa .row{flex-wrap:wrap}
  .qa input{min-width:150px}
  .week{grid-template-columns:repeat(7,minmax(150px,1fr));overflow-x:auto;padding-bottom:8px}
  .top,.body{padding-left:14px;padding-right:14px}
  .qa{margin-left:14px;margin-right:14px}
  .search{width:140px}
}
@media (max-width:640px){
  .week{grid-template-columns:1fr;overflow:visible;gap:8px}
  .col{min-height:0}
  .col.past.empty-day{display:none}
  .grid3{grid-template-columns:1fr}
  .h1{font-size:19px}
  .spacer{display:none}
  .search{width:100%;order:9}
}
`;
