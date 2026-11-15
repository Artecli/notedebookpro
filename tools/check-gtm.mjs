#!/usr/bin/env node
/**
 * Verifica se o contêiner do Google Tag Manager está implementado em todas as páginas.
 *
 * Uso:
 *   node tools/check-gtm.mjs
 *
 * Regra do projeto: o snippet do GTM fica no <head> e o fallback <noscript>
 * logo após <body>, em todas as páginas HTML (inclusive 404.html).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTAINER = "GTM-MXJTWR";
const LOADER = `<script async src="https://www.googletagmanager.com/gtm.js?id=${CONTAINER}"></script>`;
const NOSCRIPT = `https://www.googletagmanager.com/ns.html?id=${CONTAINER}`;
const IGNORED_DIRS = new Set(["assets", ".git", "tools", "node_modules"]);

function listPages(dir = ROOT) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) return [];
      return listPages(path.join(dir, entry.name));
    }
    return entry.name.endsWith(".html") ? [path.join(dir, entry.name)] : [];
  });
}

const issues = [];
const count = (text, needle) => text.split(needle).length - 1;

for (const file of listPages()) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const html = fs.readFileSync(file, "utf8");

  const headEnd = html.indexOf("</head>");
  const bodyStart = html.indexOf("<body");
  const loaderAt = html.indexOf(LOADER);

  if (loaderAt === -1) issues.push(`${rel}: sem loader do GTM`);
  else if (headEnd === -1 || loaderAt > headEnd) issues.push(`${rel}: loader fora do <head>`);
  if (count(html, LOADER) > 1) issues.push(`${rel}: loader duplicado`);

  if (!html.includes("window.dataLayer = window.dataLayer || [];"))
    issues.push(`${rel}: sem inicialização do dataLayer`);
  if (!html.includes("gtag('js', new Date());")) issues.push(`${rel}: sem chamada gtag('js', ...)`);

  const noscriptAt = html.indexOf(NOSCRIPT);
  if (noscriptAt === -1) issues.push(`${rel}: sem fallback <noscript> do GTM`);
  else if (bodyStart === -1 || noscriptAt < bodyStart) issues.push(`${rel}: <noscript> antes do <body>`);

  if (/\uFFFD/.test(html)) issues.push(`${rel}: caractere de substituição (encoding quebrado)`);
  if (!/lang="pt-BR"/.test(html)) issues.push(`${rel}: sem lang="pt-BR"`);
}

const pages = listPages().length;
console.log(
  issues.length
    ? `GTM com problemas em ${new Set(issues.map((i) => i.split(":")[0])).size} de ${pages} páginas:\n- ${issues.join("\n- ")}`
    : `GTM ${CONTAINER} no <head> e <noscript> no <body> nas ${pages} páginas HTML.`
);
process.exit(issues.length ? 1 : 0);
