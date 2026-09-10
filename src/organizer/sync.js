// Sincronizacao opcional entre dispositivos.
//
// Quando a pagina roda como Artifact publicado, `claude.use("db")` devolve um
// armazenamento de documentos ligado a conta de quem abre — os mesmos dados no
// PC e no celular, sem servidor proprio. Fora dali (Netlify, arquivo local,
// npm run dev) nao existe `window.claude`: `open()` devolve null e o app
// continua funcionando so com localStorage.
//
// Modelo: um documento por tarefa em `tasks/<id>`, mais `meta/lists`.
// Conflito resolve por `updatedAt` — quem editou por ultimo vence. Para uma
// pessoa alternando entre dois aparelhos isso basta; nao ha edicao simultanea.

export async function open() {
  if (typeof window === "undefined") return null;
  const claude = window.claude;
  if (!claude || typeof claude.use !== "function") return null;
  try {
    return await claude.use("db");
  } catch {
    return null;
  }
}

export const touch = (task) => ({ ...task, updatedAt: Date.now() });

// Campos que so fazem sentido em memoria nao sobem para o armazenamento.
export function forStorage(task) {
  const { _dateKey, ...clean } = task;
  return { ...clean, updatedAt: clean.updatedAt ?? Date.now() };
}

/**
 * Junta o que veio do servidor com o que existe aqui.
 * - presente nos dois  -> vence o `updatedAt` maior
 * - so no servidor     -> entra
 * - so aqui e ja subiu -> foi apagado noutro aparelho, sai
 * - so aqui e nao subiu-> e novo, fica (o efeito de escrita leva depois)
 */
export function merge(local, remote, alreadyPushed) {
  const byId = new Map(remote.map((t) => [t.id, t]));
  const out = [];

  for (const mine of local) {
    const theirs = byId.get(mine.id);
    if (theirs) {
      out.push((theirs.updatedAt ?? 0) >= (mine.updatedAt ?? 0) ? theirs : mine);
      byId.delete(mine.id);
    } else if (!alreadyPushed.has(mine.id)) {
      out.push(mine);
    }
  }
  for (const theirs of byId.values()) out.push(theirs);

  return out;
}

/**
 * Salvar um arquivo funciona diferente conforme onde a pagina roda.
 * Dentro do viewer de Artifact, um link <a download> e inerte: a saida e a
 * capability `downloads`, que mostra uma confirmacao ao usuario. Fora dali
 * (Netlify, local) o caminho normal do navegador serve.
 */
export async function saveFile(filename, text) {
  try {
    const dl = window.claude?.use ? await window.claude.use("downloads") : null;
    if (dl) {
      await dl.save({ filename, data: text });
      return "artifact";
    }
  } catch {
    // cai no caminho do navegador abaixo
  }
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return "browser";
}
