// Empacota o build de arquivo unico no formato que o Artifact aceita.
//
// O Artifact envolve o conteudo em <!doctype html><head>...</head><body>, entao
// o arquivo publicado nao pode trazer esses elementos: so o titulo, os estilos,
// o script que aplica o tema, o ponto de montagem e o bundle.
//
//   npx vite build --config vite.artifact.config.js
//   node scripts/build-artifact.mjs
//   -> dist-artifact/semana.artifact.html

import { readFileSync, writeFileSync } from "node:fs";

const SRC = "dist-artifact/index.html";
const OUT = "dist-artifact/semana.artifact.html";

const src = readFileSync(SRC, "utf8");
const pick = (re, what) => {
  const m = src.match(re);
  if (!m) throw new Error(`não encontrei ${what} em ${SRC}`);
  return m[1];
};

const head = pick(/<head>([\s\S]*?)<\/head>/, "o <head>");
const body = pick(/<body>([\s\S]*?)<\/body>/, "o <body>");
const title = (head.match(/<title>([\s\S]*?)<\/title>/) ?? [, "Semana"])[1];

const styles = head.match(/<style[^>]*>[\s\S]*?<\/style>/g) ?? [];
const scripts = head.match(/<script[^>]*>[\s\S]*?<\/script>/g) ?? [];
const isModule = (s) => /type\s*=\s*["']module["']/.test(s);

const out = [
  `<title>${title}</title>`,
  ...styles,
  ...scripts.filter((s) => !isModule(s)), // aplica o tema antes de pintar
  body.trim(),
  ...scripts.filter(isModule),            // o bundle por ultimo
].join("\n");

for (const tag of ["<!doctype", "<html", "<head", "<body"]) {
  if (out.toLowerCase().includes(tag)) throw new Error(`o resultado ainda contém ${tag}`);
}
if (!out.includes('id="root"')) throw new Error("o resultado não tem o ponto de montagem");

writeFileSync(OUT, out);
console.log(`${OUT}: ${out.length} bytes (de ${src.length} no build)`);
