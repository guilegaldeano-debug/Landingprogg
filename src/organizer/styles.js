export const CSS = `
:root{
  --bg:#080b14; --surface:#0d1424; --surface2:#111a2e; --line:#1a2540; --line2:#233457;
  --text:#e6edf7; --muted:#7c8db0; --dim:#4a5a7d;
  --blue:#3b82f6; --blue-dk:#1d4ed8; --blue-lt:#7dabff;
  --green:#22c55e; --amber:#f59e0b; --red:#ef4444; --violet:#a78bfa;
}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:'DM Mono',ui-monospace,monospace}
button,input,select,textarea{font-family:inherit;color:inherit}
button{cursor:pointer}
::selection{background:var(--blue);color:#fff}
::-webkit-scrollbar{width:9px;height:9px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--line2);border-radius:9px}
::-webkit-scrollbar-thumb:hover{background:var(--dim)}

.app{display:flex;min-height:100vh}

/* ---------- sidebar ---------- */
.side{width:236px;flex:0 0 236px;background:var(--surface);border-right:1px solid var(--line);
  padding:18px 14px;display:flex;flex-direction:column;gap:18px;position:sticky;top:0;height:100vh;overflow-y:auto}
.brand{display:flex;align-items:center;gap:10px}
.brand .mark{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--blue-dk),var(--violet));
  display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:#fff}
.brand b{font-size:14px;font-weight:700;letter-spacing:.5px}
.brand span{display:block;font-size:9px;color:var(--dim);letter-spacing:2px}
.sec{font-size:9px;color:var(--dim);letter-spacing:2.2px;margin:0 0 8px 6px}
.navbtn{display:flex;align-items:center;gap:9px;width:100%;background:transparent;border:1px solid transparent;
  border-radius:8px;padding:8px 10px;font-size:12.5px;color:var(--muted);text-align:left;transition:.12s}
.navbtn:hover{background:var(--surface2);color:var(--text)}
.navbtn.on{background:rgba(59,130,246,.13);border-color:rgba(59,130,246,.4);color:#fff}
.navbtn .cnt{margin-left:auto;font-size:10px;color:var(--dim);background:var(--surface2);
  border-radius:20px;padding:1px 7px;min-width:20px;text-align:center}
.navbtn.on .cnt{color:var(--blue-lt);background:rgba(59,130,246,.16)}
.dot{width:9px;height:9px;border-radius:50%;flex:0 0 9px}
.side .foot{margin-top:auto;display:flex;flex-direction:column;gap:7px}
.ghost{background:transparent;border:1px solid var(--line2);border-radius:7px;color:var(--muted);
  font-size:11px;padding:7px 10px;transition:.12s}
.ghost:hover{border-color:var(--blue);color:var(--blue-lt)}

/* ---------- main ---------- */
.main{flex:1;min-width:0;display:flex;flex-direction:column}
.top{display:flex;align-items:center;gap:14px;padding:16px 22px 0;flex-wrap:wrap}
.h1{font-size:19px;font-weight:700;margin:0}
.sub{font-size:11px;color:var(--muted);margin-top:2px}
.nav{display:flex;gap:5px;align-items:center}
.icobtn{background:var(--surface);border:1px solid var(--line);border-radius:7px;color:var(--muted);
  width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:13px;transition:.12s}
.icobtn:hover{border-color:var(--blue);color:var(--blue-lt)}
.seg{display:flex;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:3px;gap:2px}
.seg button{background:transparent;border:none;border-radius:6px;color:var(--muted);font-size:11.5px;padding:6px 13px;transition:.12s}
.seg button.on{background:var(--blue-dk);color:#fff}
.spacer{flex:1}
.progress{display:flex;align-items:center;gap:9px;font-size:11px;color:var(--muted)}
.bar{width:110px;height:5px;border-radius:5px;background:var(--line);overflow:hidden}
.bar i{display:block;height:100%;background:linear-gradient(90deg,var(--blue),var(--green));transition:width .35s}

/* ---------- quick add ---------- */
.qa{margin:14px 22px 0;background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:11px 13px}
.qa.focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,130,246,.12)}
.qa .row{display:flex;align-items:center;gap:10px}
.qa input{flex:1;background:transparent;border:none;outline:none;font-size:13.5px;padding:3px 0}
.qa input::placeholder{color:var(--dim)}
.addbtn{background:linear-gradient(135deg,var(--blue-dk),var(--blue));border:none;border-radius:7px;color:#fff;
  font-size:12px;font-weight:700;padding:8px 16px;white-space:nowrap}
.addbtn:disabled{opacity:.35}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
.chip{font-size:10.5px;padding:3px 9px;border-radius:20px;border:1px solid var(--line2);color:var(--muted);background:var(--surface2)}
.chip.b{border-color:rgba(59,130,246,.45);color:var(--blue-lt)}
.chip.v{border-color:rgba(167,139,250,.45);color:var(--violet)}
.chip.a{border-color:rgba(245,158,11,.45);color:var(--amber)}
.chip.r{border-color:rgba(239,68,68,.45);color:#fca5a5}
.hint{font-size:10px;color:var(--dim);margin-top:8px;line-height:1.6}
.hint code{background:var(--surface2);border:1px solid var(--line);border-radius:4px;padding:1px 5px;color:var(--muted)}

/* ---------- week grid ---------- */
.body{flex:1;padding:14px 22px 26px;min-width:0}
.week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;align-items:stretch}
.col{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:7px;
  min-height:clamp(240px,58vh,560px);display:flex;flex-direction:column;gap:6px;transition:.12s}
.col.today{border-color:rgba(59,130,246,.55);background:linear-gradient(180deg,rgba(59,130,246,.07),var(--surface) 90px)}
.col.past{opacity:.62}
.col.over{border-color:var(--blue);background:rgba(59,130,246,.1)}
.colhead{display:flex;align-items:baseline;gap:6px;padding:1px 2px 6px;border-bottom:1px solid var(--line)}
.colhead .dw{font-size:10px;letter-spacing:1.6px;color:var(--muted);text-transform:uppercase}
.colhead .dn{font-size:16px;font-weight:700}
.col.today .dn{color:var(--blue-lt)}
.colhead .n{margin-left:auto;font-size:9.5px;color:var(--dim)}
.empty{font-size:10.5px;color:var(--dim);text-align:center;padding:14px 4px}

/* ---------- task card ---------- */
.task{display:flex;align-items:flex-start;gap:7px;background:var(--surface2);border:1px solid var(--line);
  border-left:3px solid var(--line2);border-radius:7px;padding:6px 8px;cursor:grab;transition:.12s}
.task:hover{border-color:var(--line2);transform:translateY(-1px)}
.task.dragging{opacity:.35}
.task.done{opacity:.42}
.task.done .t{text-decoration:line-through;color:var(--muted)}
.task .check{flex:0 0 15px;width:15px;height:15px;margin-top:1px;border-radius:5px;border:1.5px solid var(--line2);
  background:transparent;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;padding:0}
.task .check:hover{border-color:var(--green)}
.task.done .check{background:var(--green);border-color:var(--green)}
.task .mid{min-width:0;flex:1}
.task .t{font-size:11.5px;line-height:1.35;overflow-wrap:anywhere;hyphens:auto}
.task .meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:3px;font-size:9.5px;color:var(--dim)}
.task .time{color:var(--blue-lt)}
.task .late{color:#fca5a5}

/* ---------- day timeline ---------- */
.day{display:grid;grid-template-columns:56px 1fr;gap:0;background:var(--surface);border:1px solid var(--line);border-radius:10px;overflow:hidden}
.hr{border-top:1px solid var(--line);min-height:52px;position:relative}
.hr.lbl{color:var(--dim);font-size:10px;padding:4px 8px;text-align:right;background:rgba(0,0,0,.16)}
.hr.slot{padding:5px;display:flex;flex-direction:column;gap:5px}
.hr.slot:hover{background:rgba(59,130,246,.05)}
.hr.slot.over{background:rgba(59,130,246,.12)}
.nowline{position:absolute;left:0;right:0;height:2px;background:var(--red);z-index:3;pointer-events:none}
.nowline::before{content:"";position:absolute;left:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:var(--red)}
.untimed{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:11px;margin-bottom:10px;
  display:flex;flex-direction:column;gap:6px}

/* ---------- list view ---------- */
.group{margin-bottom:18px}
.collapse{background:none;border:none;color:var(--dim);font-size:12px;padding:0 2px}
.collapse:hover{color:var(--blue-lt)}
.grouphead{display:flex;align-items:center;gap:8px;font-size:11px;letter-spacing:1.6px;color:var(--muted);
  text-transform:uppercase;margin-bottom:8px}
.grouphead .line{flex:1;height:1px;background:var(--line)}
.stack{display:flex;flex-direction:column;gap:6px}

/* ---------- backlog ---------- */
.backlog{width:214px;flex:0 0 214px}
.backlog.closed{width:auto;flex:0 0 auto}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:11px;
  display:flex;flex-direction:column;gap:7px;min-height:150px}
.panel.over{border-color:var(--blue);background:rgba(59,130,246,.08)}
.split{display:flex;gap:14px;align-items:flex-start}

/* ---------- modal ---------- */
.scrim{position:fixed;inset:0;background:rgba(4,7,14,.78);backdrop-filter:blur(3px);z-index:50;
  display:flex;align-items:center;justify-content:center;padding:18px}
.modal{background:var(--surface);border:1px solid var(--line2);border-radius:13px;padding:20px;
  width:100%;max-width:460px;max-height:88vh;overflow-y:auto}
.modal h3{margin:0 0 14px;font-size:13px;letter-spacing:1.6px;color:var(--muted);text-transform:uppercase}
.field{margin-bottom:11px}
.field label{display:block;font-size:9.5px;letter-spacing:1.4px;color:var(--dim);margin-bottom:5px;text-transform:uppercase}
.inp{width:100%;background:#0a0f1e;border:1px solid var(--line2);border-radius:7px;color:var(--text);
  font-size:12.5px;padding:9px 11px;outline:none}
.inp:focus{border-color:var(--blue)}
textarea.inp{resize:vertical;min-height:64px;line-height:1.5}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px}
.pick{display:flex;gap:6px;flex-wrap:wrap}
.pick button{background:#0a0f1e;border:1px solid var(--line2);border-radius:7px;color:var(--muted);font-size:11px;padding:6px 11px}
.pick button.on{border-color:var(--blue);background:rgba(59,130,246,.16);color:#fff}
.modal .acts{display:flex;gap:8px;margin-top:16px}
.danger{background:transparent;border:1px solid rgba(239,68,68,.4);color:#fca5a5;border-radius:7px;font-size:11.5px;padding:9px 14px}
.danger:hover{background:rgba(239,68,68,.12)}

/* ---------- focus timer ---------- */
.ftimer{position:fixed;right:18px;bottom:18px;z-index:40;background:var(--surface);border:1px solid var(--line2);
  border-radius:12px;padding:13px 15px;min-width:210px;box-shadow:0 12px 34px rgba(0,0,0,.55)}
.ftimer.run{border-color:rgba(34,197,94,.5)}
.ftimer .lab{font-size:9px;letter-spacing:2px;color:var(--dim);text-transform:uppercase}
.ftimer .clock{font-size:31px;font-weight:700;letter-spacing:1px;margin:3px 0 2px;font-variant-numeric:tabular-nums}
.ftimer .task-name{font-size:10.5px;color:var(--muted);margin-bottom:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ftimer .btns{display:flex;gap:6px}
.ftimer .btns button{flex:1;font-size:11px;padding:6px 0;border-radius:6px;border:1px solid var(--line2);background:#0a0f1e;color:var(--muted)}
.ftimer .btns button.pri{background:linear-gradient(135deg,var(--blue-dk),var(--blue));border:none;color:#fff;font-weight:700}
.fab{position:fixed;right:18px;bottom:18px;z-index:40;width:46px;height:46px;border-radius:50%;
  background:var(--surface);border:1px solid var(--line2);font-size:18px;box-shadow:0 8px 24px rgba(0,0,0,.5)}

/* ---------- toast ---------- */
.toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:60;background:var(--surface2);
  border:1px solid var(--line2);border-radius:9px;padding:9px 16px;font-size:11.5px;color:var(--text);
  box-shadow:0 8px 26px rgba(0,0,0,.5);display:flex;align-items:center;gap:12px}
.toast button{background:none;border:none;color:var(--blue-lt);font-size:11.5px;font-weight:700}

/* ---------- responsivo ---------- */
@media (max-width:1240px){ .backlog{flex:0 0 186px;width:186px} }
@media (max-width:980px){
  .app{flex-direction:column}
  .side{width:auto;flex:none;height:auto;position:static;flex-direction:row;align-items:center;
    overflow-x:auto;gap:10px;padding:11px 14px;border-right:none;border-bottom:1px solid var(--line)}
  .side .sec,.side .foot .lbl{display:none}
  .side .grp{display:flex;gap:6px}
  .side .foot{margin:0 0 0 auto;flex-direction:row}
  .navbtn{width:auto;white-space:nowrap}
  .split{flex-direction:column;align-items:stretch}
  .backlog{width:100%;flex:none}
  .backlog.closed{width:100%}
  .qa .row{flex-wrap:wrap}
  .qa input{min-width:150px}
  .week{grid-template-columns:repeat(7,minmax(140px,1fr));overflow-x:auto;padding-bottom:8px}
  .top,.qa,.body{padding-left:14px;padding-right:14px}
  .qa{margin-left:14px;margin-right:14px}
}
@media (max-width:640px){
  .week{grid-template-columns:1fr;overflow:visible}
  .col{min-height:0}
  .week{gap:8px}
  .col.past.empty-day{display:none}
  .grid3{grid-template-columns:1fr}
}
`;
