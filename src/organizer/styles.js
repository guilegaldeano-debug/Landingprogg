export const CSS = `
/* ============================================================
   Linguagem visual do macOS/iOS: separacao por material e espaco,
   nao por contorno. Cor so no que e interativo ou selecionado.
   Contrastes de texto medidos (AA >= 4.5:1) — os valores da Apple
   para secondaryLabel foram escurecidos onde nao passavam.
   ============================================================ */
:root{
  color-scheme:dark;
  --bg:#1c1c1e;
  --sidebar:#161618;
  --raised:#2c2c2e;
  --fill:rgba(120,120,128,.24);
  --fill-soft:rgba(120,120,128,.14);
  --hairline:rgba(255,255,255,.09);
  --hairline-strong:rgba(255,255,255,.15);
  --label:#fff;
  --label2:#adadb4;
  --label3:#8a8a90;
  --accent:#0a84ff;
  --accent-fill:#0a84ff;
  --on-accent:#fff;
  --accent-tint:rgba(10,132,255,.20);
  --thumb:rgba(120,120,128,.46);
  --thumb-shadow:0 1px 2px rgba(0,0,0,.35);
  --red:#ff453a; --green:#30d158; --orange:#ff9f0a;
  --tint-a:.22;              /* opacidade do bloco de compromisso */
  --sheet-shadow:0 24px 68px rgba(0,0,0,.62);
  --pop-shadow:0 10px 34px rgba(0,0,0,.5);
  --scrim:rgba(0,0,0,.5);
  --radius:10px; --radius-lg:14px; --radius-xl:18px;
  --font:-apple-system,BlinkMacSystemFont,'SF Pro Text','SF Pro Display','Segoe UI',
         system-ui,Roboto,'Helvetica Neue',sans-serif;
  --mono:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;
}
:root[data-theme="light"]{
  color-scheme:light;
  --bg:#fff;
  --sidebar:#f2f2f4;
  --raised:#fff;
  --fill:rgba(120,120,128,.14);
  --fill-soft:rgba(120,120,128,.08);
  --hairline:rgba(60,60,67,.13);
  --hairline-strong:rgba(60,60,67,.22);
  --label:#1d1d1f;
  --label2:#6d6d72;
  --label3:#86868b;
  --accent:#0071e3;
  --accent-fill:#0071e3;
  --accent-tint:rgba(0,113,227,.14);
  --thumb:#fff;
  --thumb-shadow:0 1px 3px rgba(0,0,0,.14),0 0 0 .5px rgba(0,0,0,.05);
  --red:#d70015; --green:#248a3d; --orange:#b25000;
  --tint-a:.16;
  --sheet-shadow:0 24px 68px rgba(0,0,0,.22);
  --pop-shadow:0 10px 34px rgba(0,0,0,.14);
  --scrim:rgba(0,0,0,.24);
}

*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--label);font-family:var(--font);
  font-size:13px;line-height:1.45;letter-spacing:-.004em;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
button,input,select,textarea{font:inherit;color:inherit;letter-spacing:inherit}
button{cursor:pointer;border:none;background:none;padding:0}
:focus{outline:none}
:focus-visible{outline:3px solid var(--accent);outline-offset:1px;border-radius:6px}
::selection{background:var(--accent);color:#fff}
::-webkit-scrollbar{width:14px;height:14px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--fill);border-radius:10px;border:4px solid transparent;background-clip:content-box}
::-webkit-scrollbar-thumb:hover{background:var(--hairline-strong);background-clip:content-box}
.tnum{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}

.app{display:flex;min-height:100vh}

/* ============ barra lateral ============ */
.sidebar{width:232px;flex:0 0 232px;background:var(--sidebar);padding:16px 10px 12px;
  display:flex;flex-direction:column;gap:22px;position:sticky;top:0;height:100vh;overflow-y:auto}
.brand{padding:2px 8px 0}
.brand b{display:block;font-size:19px;font-weight:600;letter-spacing:-.02em}
.brand span{display:block;font-size:12px;color:var(--label3);margin-top:1px}
.navsec+.navsec{margin-top:2px}
.navsec h2{font-size:12px;font-weight:600;color:var(--label3);margin:0 0 4px 8px;letter-spacing:0}
.navitem{display:flex;align-items:center;gap:9px;width:100%;border-radius:var(--radius);
  padding:6px 8px;font-size:13.5px;color:var(--label);text-align:left;
  transition:background .1s ease}
.navitem:hover{background:var(--fill-soft)}
.navitem.on{background:var(--fill)}
.navitem .gi{color:var(--accent);flex:0 0 auto;display:flex}
.navitem .swatch{width:11px;height:11px;border-radius:50%;flex:0 0 11px;margin:0 3px}
.navitem .cnt{margin-left:auto;font-size:12.5px;color:var(--label3);font-variant-numeric:tabular-nums}
.navitem.add{color:var(--label3)}
.navitem.add .gi{color:var(--label3)}

.sidebar .foot{margin-top:auto;display:flex;flex-direction:column;gap:12px;padding:0 4px}
.iconbar{display:flex;gap:2px}
.iconbtn{width:30px;height:28px;border-radius:7px;color:var(--label2);
  display:flex;align-items:center;justify-content:center;transition:background .1s,color .1s}
.iconbtn:hover{background:var(--fill-soft);color:var(--label)}
.iconbtn.on{color:var(--accent);background:var(--accent-tint)}
.disclaimer{font-size:11.5px;color:var(--label3);line-height:1.45}

/* ============ barra de ferramentas ============ */
.main{flex:1;min-width:0;display:flex;flex-direction:column}
.toolbar{display:flex;align-items:flex-end;gap:16px;padding:22px 26px 16px;flex-wrap:wrap}
.titleblock h1{font-size:26px;font-weight:600;margin:0;letter-spacing:-.025em;line-height:1.15}
.titleblock p{font-size:13px;color:var(--label2);margin:3px 0 0}
.grow{flex:1}
.tools{display:flex;align-items:center;gap:10px;padding-bottom:2px;flex-wrap:wrap;min-width:0}
.stepper{display:flex;align-items:center;gap:1px;background:var(--fill-soft);border-radius:8px;padding:2px}
.stepper button{height:26px;min-width:28px;border-radius:6px;color:var(--label);
  display:flex;align-items:center;justify-content:center;transition:background .1s}
.stepper button:hover{background:var(--fill)}
.stepper .today{padding:0 11px;font-size:12.5px;font-weight:500}
.segmented{display:flex;background:var(--fill-soft);border-radius:8px;padding:2px;gap:2px}
.segmented button{border-radius:6px;color:var(--label);font-size:12.5px;padding:5px 14px;
  transition:background .12s,box-shadow .12s}
.segmented button.on{background:var(--thumb);box-shadow:var(--thumb-shadow);font-weight:500}
.searchbox{display:flex;align-items:center;gap:6px;background:var(--fill-soft);border-radius:8px;
  padding:0 9px;height:30px;width:190px;color:var(--label3);transition:background .12s}
.searchbox:focus-within{background:var(--fill)}
.searchbox input{flex:1;min-width:0;background:none;border:none;outline:none;font-size:13px;color:var(--label)}
.searchbox input::placeholder{color:var(--label3)}

/* ============ campo de captura ============ */
.composer{margin:0 26px 14px;background:var(--fill-soft);border-radius:var(--radius-lg);
  padding:0 8px 0 12px;transition:background .12s,box-shadow .12s}
.composer.focus{background:var(--raised);box-shadow:0 0 0 3px var(--accent-tint),var(--pop-shadow)}
.composer .row{display:flex;align-items:center;gap:9px}
.composer .gi{color:var(--label3);flex:0 0 auto;display:flex}
.composer.focus .gi{color:var(--accent)}
.composer input{flex:1;min-width:0;background:none;border:none;outline:none;
  font-size:14.5px;padding:11px 0;letter-spacing:-.01em}
.composer input::placeholder{color:var(--label3)}
.addbtn{background:var(--accent-fill);border-radius:8px;color:var(--on-accent);font-size:13px;
  font-weight:500;padding:6px 14px;white-space:nowrap;transition:opacity .12s}
.addbtn:hover:not(:disabled){opacity:.86}
.addbtn:disabled{background:var(--fill);color:var(--label3);cursor:default}
.readout{display:flex;gap:6px;flex-wrap:wrap;padding:0 0 11px 27px;font-size:12.5px;color:var(--label2)}
.readout b{font-weight:500;color:var(--label)}
.readout .sep{color:var(--label3)}
.readout .k{color:var(--accent)}
.syntax{padding:0 0 11px 27px;font-size:12.5px;color:var(--label3);line-height:1.75}
.syntax code{font-family:var(--font);color:var(--label2);background:var(--fill-soft);
  border-radius:5px;padding:1px 6px;margin-right:2px}

/* ============ semana ============ */
.content{flex:1;padding:0 26px 30px;min-width:0}
.weekwrap{display:flex;border-top:1px solid var(--hairline);min-height:calc(100vh - 250px)}
.weekgrid{flex:1;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));min-width:0}
.daycol{padding:12px 8px 14px;min-width:0;display:flex;flex-direction:column;gap:4px;
  border-left:1px solid var(--hairline);transition:background .12s}
.daycol:first-child{border-left:none}
.daycol.over{background:var(--accent-tint)}
.daycol.past .dayhead{opacity:.45}
.dayhead{display:flex;align-items:center;gap:6px;padding:0 4px 8px}
.dayhead .dw{font-size:12px;color:var(--label3);font-weight:400}
.dayhead .dn{font-size:16px;font-weight:500;letter-spacing:-.02em;font-variant-numeric:tabular-nums;
  min-width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%}
.daycol.today .dn{background:var(--accent-fill);color:var(--on-accent)}
.daycol.today .dw{color:var(--accent);font-weight:500}
.dayhead .hrs{margin-left:auto;font-size:11.5px;color:var(--label3);font-variant-numeric:tabular-nums}
.daycol .none{font-size:12.5px;color:var(--label3);padding:4px;opacity:.6}

/* ============ compromisso (tem hora) x tarefa (nao tem) ============ */
.item{display:flex;align-items:flex-start;gap:7px;border-radius:8px;padding:6px 7px;cursor:grab;
  transition:background .1s,opacity .12s,transform .1s}
.item:active{cursor:grabbing}
.item.dragging{opacity:.3}
.item.todo:hover{background:var(--fill-soft)}
.item.event{background:var(--tint);padding:7px 9px 8px;color:var(--evt-text)}
.item.event:hover{filter:brightness(1.07)}
.item.event .circle{border-color:currentColor;opacity:.55}
.item.event .circle:hover{opacity:1}
.item.event.done .circle{background:currentColor;border-color:currentColor;opacity:1}
.item.event.done .circle svg{color:var(--tint-solid,var(--bg))}
.item.done{opacity:.42}
.item.done .title{text-decoration:line-through;text-decoration-thickness:1px}
.circle{flex:0 0 16px;width:16px;height:16px;margin-top:1px;border-radius:50%;
  border:1.5px solid var(--hairline-strong);display:flex;align-items:center;justify-content:center;
  transition:background .14s,border-color .14s,transform .12s}
.circle:hover{border-color:var(--accent);transform:scale(1.14)}
.circle svg{opacity:0;transition:opacity .12s}
.item.done .circle{background:var(--accent-fill);border-color:var(--accent-fill)}
.item.done .circle svg{opacity:1;color:var(--on-accent)}
.item .body{min-width:0;flex:1}
.item .title{font-size:13px;line-height:1.34;letter-spacing:-.006em;overflow-wrap:break-word}
.bang{color:var(--red);font-weight:600;margin-right:3px;letter-spacing:-.06em}
.item .sub{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:1px;
  font-size:11.5px;color:var(--label2);font-variant-numeric:tabular-nums}
.item.event .sub{color:currentColor;opacity:.78}
.item .sub .late{color:var(--red)}
.item .sub .gi{display:flex;opacity:.8}
.item .listname{color:var(--label3)}

/* ============ coluna sem data ============ */
.unscheduled{flex:0 0 214px;width:214px;padding:12px 10px 14px;border-left:1px solid var(--hairline);
  display:flex;flex-direction:column;gap:4px;transition:background .12s}
.unscheduled.over{background:var(--accent-tint)}
.unscheduled.closed{flex:0 0 auto;width:auto}
.uhead{display:flex;align-items:center;gap:6px;padding:0 4px 8px;font-size:12.5px;
  font-weight:500;color:var(--label2)}
.uhead .cnt{margin-left:auto;color:var(--label3);font-variant-numeric:tabular-nums}
.uhead button{color:var(--label3);display:flex;transition:color .1s}
.uhead button:hover{color:var(--label)}

/* ============ dia ============ */
.dayview{border-top:1px solid var(--hairline)}
.alldaystrip{padding:10px 0;border-bottom:1px solid var(--hairline);display:flex;flex-direction:column;gap:3px}
.alldaystrip .lab{font-size:12px;color:var(--label3);padding:0 4px 4px}
.timeline{display:grid;grid-template-columns:62px 1fr}
.trow{border-bottom:1px solid var(--hairline);min-height:48px;position:relative}
.trow.h{color:var(--label3);font-size:12px;padding:6px 12px 0 0;text-align:right;
  font-variant-numeric:tabular-nums;border-bottom-color:transparent}
.trow.s{padding:4px 6px;display:flex;flex-direction:column;gap:3px;transition:background .1s}
.trow.s:hover{background:var(--fill-soft)}
.trow.s.over{background:var(--accent-tint)}
.nowline{position:absolute;left:0;right:0;height:1.5px;background:var(--red);z-index:3;pointer-events:none}
.nowline::before{content:"";position:absolute;left:-3.5px;top:-3px;width:8px;height:8px;
  border-radius:50%;background:var(--red)}

/* ============ lista ============ */
.section{margin-bottom:26px}
.sectionhead{display:flex;align-items:baseline;gap:8px;padding:0 0 7px;
  border-bottom:1px solid var(--hairline);margin-bottom:6px}
.sectionhead h2{font-size:15px;font-weight:600;margin:0;letter-spacing:-.015em}
.sectionhead .cnt{margin-left:auto;font-size:12.5px;color:var(--label3);font-variant-numeric:tabular-nums}
.sectionhead.alert h2{color:var(--red)}
.rows{display:flex;flex-direction:column}
.rows .item{border-radius:8px}
.rows .item.todo+.item.todo{box-shadow:inset 0 1px 0 var(--hairline)}

/* ============ folha modal ============ */
.scrim{position:fixed;inset:0;background:var(--scrim);backdrop-filter:blur(20px) saturate(140%);
  -webkit-backdrop-filter:blur(20px) saturate(140%);z-index:50;
  display:flex;align-items:center;justify-content:center;padding:20px;animation:fade .16s ease}
@keyframes fade{from{opacity:0}to{opacity:1}}
.sheet{background:var(--raised);border-radius:var(--radius-xl);padding:24px;width:100%;max-width:440px;
  max-height:86vh;overflow-y:auto;box-shadow:var(--sheet-shadow);animation:lift .2s cubic-bezier(.32,.72,0,1)}
@keyframes lift{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}
.sheet h3{margin:0 0 18px;font-size:17px;font-weight:600;letter-spacing:-.02em}
.row2{margin-bottom:14px}
.row2>label{display:block;font-size:12.5px;color:var(--label2);margin-bottom:5px}
.field{width:100%;background:var(--fill-soft);border:none;border-radius:9px;color:var(--label);
  font-size:13.5px;padding:9px 11px;outline:none;transition:box-shadow .12s,background .12s}
.field:focus{background:var(--raised);box-shadow:0 0 0 3px var(--accent-tint)}
textarea.field{resize:vertical;min-height:70px;line-height:1.5}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.three{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.choices{display:flex;gap:5px;flex-wrap:wrap}
.choices button{background:var(--fill-soft);border-radius:8px;color:var(--label);font-size:12.5px;
  padding:7px 12px;transition:background .12s,color .12s}
.choices button:hover{background:var(--fill)}
.choices button.on{background:var(--accent-fill);color:var(--on-accent);font-weight:500}
.sheet .actions{display:flex;gap:8px;margin-top:22px}
.btn{border-radius:9px;font-size:13.5px;font-weight:500;padding:9px 16px;background:var(--fill-soft);
  color:var(--label);transition:background .12s}
.btn:hover{background:var(--fill)}
.btn.primary{background:var(--accent-fill);color:var(--on-accent);flex:1}
.btn.primary:hover{background:var(--accent-fill);opacity:.86}
.btn.destructive{color:var(--red)}
.btn.wide{width:100%;margin-top:2px}

/* ============ timer ============ */
.timer{position:fixed;right:22px;bottom:22px;z-index:40;background:var(--raised);
  border-radius:var(--radius-xl);padding:16px 18px;min-width:212px;box-shadow:var(--sheet-shadow);
  animation:lift .2s cubic-bezier(.32,.72,0,1)}
.timer .lab{font-size:12px;color:var(--label2)}
.timer .clock{font-size:40px;font-weight:500;margin:2px 0 0;letter-spacing:-.045em;
  font-variant-numeric:tabular-nums;line-height:1.05}
.timer.run .clock{color:var(--accent)}
.timer .who{font-size:12px;color:var(--label3);margin:2px 0 13px;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
.timer .btns{display:flex;gap:6px}
.timer .btns .btn{flex:1;padding:8px 0;text-align:center;font-size:12.5px}
.fab{position:fixed;right:22px;bottom:22px;z-index:40;width:42px;height:42px;border-radius:50%;
  background:var(--raised);color:var(--label2);box-shadow:var(--pop-shadow);
  display:flex;align-items:center;justify-content:center;transition:color .12s,transform .12s}
.fab:hover{color:var(--accent);transform:scale(1.06)}

/* ============ aviso ============ */
.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;
  background:rgba(44,44,46,.82);backdrop-filter:blur(24px) saturate(160%);
  -webkit-backdrop-filter:blur(24px) saturate(160%);color:#fff;
  border-radius:999px;padding:10px 20px;font-size:13px;box-shadow:var(--pop-shadow);
  display:flex;align-items:center;gap:16px;max-width:min(90vw,470px);animation:rise .22s cubic-bezier(.32,.72,0,1)}
:root[data-theme="light"] .toast{background:rgba(250,250,252,.82);color:var(--label);
  box-shadow:var(--pop-shadow),0 0 0 .5px rgba(0,0,0,.06)}
@keyframes rise{from{opacity:0;transform:translate(-50%,14px)}to{opacity:1;transform:translate(-50%,0)}}
.toast span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.toast button{color:var(--accent);font-weight:500;white-space:nowrap;font-size:13px}

/* ============ responsivo ============ */
@media (max-width:1180px){ .unscheduled{flex:0 0 182px;width:182px} }
@media (max-width:1000px){
  .app{flex-direction:column}
  .sidebar{width:auto;flex:none;height:auto;position:sticky;top:0;z-index:30;flex-direction:row;
    align-items:center;overflow-x:auto;gap:10px;padding:9px 14px;
    box-shadow:inset 0 -1px 0 var(--hairline)}
  .sidebar .brand,.sidebar .navsec h2,.sidebar .disclaimer{display:none}
  .navsec+.navsec{margin:0}
  .navsec .group{display:flex;gap:3px}
  .sidebar .foot{margin:0 0 0 auto;flex-direction:row;align-items:center;padding:0}
  .navitem{width:auto;white-space:nowrap}
  .weekwrap{flex-direction:column}
  .weekgrid{grid-template-columns:repeat(7,minmax(146px,1fr));overflow-x:auto}
  .unscheduled,.unscheduled.closed{flex:none;width:100%;border-left:none;
    box-shadow:inset 0 1px 0 var(--hairline)}
  .toolbar{padding:16px 16px 12px}
  .composer{margin-left:16px;margin-right:16px}
  .content{padding-left:16px;padding-right:16px}
  .searchbox{width:150px}
}
@media (max-width:660px){
  .weekgrid{grid-template-columns:1fr;overflow:visible}
  .daycol{border-left:none;box-shadow:inset 0 1px 0 var(--hairline);padding:10px 4px 12px}
  .daycol:first-child{box-shadow:none}
  .daycol.past.vazio{display:none}
  .three{grid-template-columns:1fr}
  .titleblock h1{font-size:22px}
  .grow{display:none}
  .toolbar{gap:12px}
  .tools{width:100%}
  .searchbox{width:100%;order:9;flex:1 1 100%}
  .composer .row{flex-wrap:wrap}
  .composer input{min-width:150px}
}
`;
