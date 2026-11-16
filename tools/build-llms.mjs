#!/usr/bin/env node
/**
 * Gera o llms.txt a partir das páginas HTML do site.
 *
 * Uso:
 *   node tools/build-llms.mjs          # grava llms.txt
 *   node tools/build-llms.mjs --check  # apenas verifica se está sincronizado
 *
 * Regra do projeto: toda página indexável precisa aparecer no llms.txt.
 * Páginas novas são detectadas automaticamente pelas regras de seção.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://www.notedebookpro.com.br";
const OUT_FILE = path.join(ROOT, "llms.txt");
const CHECK = process.argv.includes("--check");

/* ------------------------------------------------------------------ */
/* Coleta de páginas                                                   */
/* ------------------------------------------------------------------ */

const IGNORED = new Set(["404.html"]);

function listPages(dir = ROOT) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      if (["assets", ".git", "tools", "node_modules"].includes(entry.name)) return [];
      return listPages(path.join(dir, entry.name));
    }
    if (!entry.name.endsWith(".html")) return [];
    return [path.relative(ROOT, path.join(dir, entry.name)).replace(/\\/g, "/")];
  });
}

const decode = (value = "") =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

const clean = (html = "") =>
  decode(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

function readPage(rel) {
  const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const title = clean((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
  const description = clean((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || `${BASE}/${rel}`;
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || "";
  const h1 = clean((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "");
  return { rel, html, title, description, canonical, robots, h1 };
}

const pages = listPages()
  .filter((rel) => !IGNORED.has(rel))
  .map(readPage)
  .filter((page) => !/noindex/i.test(page.robots));

const byRel = new Map(pages.map((page) => [page.rel, page]));

/* ------------------------------------------------------------------ */
/* Ordem e rótulos                                                     */
/* ------------------------------------------------------------------ */

const MAIN_ORDER = [
  "index.html",
  "servicos.html",
  "assistencia-tecnica-notebook-dell/index.html",
  "assistencia-tecnica-notebook-hp/index.html",
  "assistencia-tecnica-notebook-lenovo/index.html",
  "assistencia-tecnica-notebook-acer/index.html",
  "assistencia-tecnica-notebook-asus/index.html",
  "assistencia-tecnica-notebook-samsung/index.html",
  "assistencia-tecnica-notebook-avell/index.html",
  "assistencia-tecnica-notebook-msi/index.html",
  "blog/index.html",
  "sobre.html",
  "contato.html",
  "privacidade.html",
];

const LABELS = {
  "index.html": "Assistência técnica de notebook em São Paulo",
  "servicos.html": "Serviços de reparo de notebook",
  "blog/index.html": "Blog técnico — índice de guias",
  "sobre.html": "Sobre a NOTEDEBOOKPRO",
  "contato.html": "Contato e orçamento",
  "privacidade.html": "Política de Privacidade",
};

const labelFor = (page) => LABELS[page.rel] || page.h1 || page.title;

const sentence = (text) => {
  const value = (text || "").trim();
  if (!value) return "";
  return /[.!?]$/.test(value) ? value : `${value}.`;
};

/** Ordem dos guias conforme os cards do blog, com fallback alfabético. */
function blogOrder() {
  const blogIndex = byRel.get("blog/index.html");
  const listed = blogIndex
    ? [...blogIndex.html.matchAll(/href="(?:\.\.\/)?blog\/([a-z0-9-]+)"/g)].map((m) => `blog/${m[1]}.html`)
    : [];
  const unique = [...new Set(listed)];
  const rest = pages
    .filter((page) => page.rel.startsWith("blog/") && !unique.includes(page.rel))
    .map((page) => page.rel)
    .sort();
  return [...unique, ...rest].filter((rel) => byRel.has(rel));
}

/** Serviços detalhados com âncora, extraídos de servicos.html. */
function serviceAnchors() {
  const page = byRel.get("servicos.html");
  if (!page) return [];
  const blocks = page.html.split(/<article class="service-detail" id="/).slice(1);
  return blocks.flatMap((block) => {
    const id = block.slice(0, block.indexOf('"'));
    const body = block.slice(block.indexOf('"') + 1);
    const heading = clean((body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "");
    const afterHeading = body.slice(body.indexOf("</h2>") + 5);
    const paragraph = clean((afterHeading.match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || "");
    if (!id || !heading) return [];
    return [{ id, heading, paragraph: paragraph.split(/(?<=[.!?])\s+/)[0] }];
  });
}

/** Agrupa em seções previsíveis, incluindo páginas que ainda não têm regra. */
function buildEntries() {
  const used = new Set();
  const take = (rel) => {
    const page = byRel.get(rel);
    if (!page || used.has(rel)) return null;
    used.add(rel);
    return page;
  };

  const main = MAIN_ORDER.filter(
    (rel) => !rel.startsWith("assistencia-tecnica-notebook-") && !rel.startsWith("blog/")
  )
    .map(take)
    .filter(Boolean);

  const brandPattern = /^assistencia-tecnica-notebook-[a-z0-9-]+\/index\.html$/;
  const brands = [
    ...MAIN_ORDER.filter((rel) => brandPattern.test(rel)),
    ...pages
      .map((page) => page.rel)
      .filter((rel) => brandPattern.test(rel))
      .sort((a, b) => a.localeCompare(b, "pt-BR")),
  ]
    .map(take)
    .filter(Boolean);

  const guides = blogOrder().map(take).filter(Boolean);

  const others = pages
    .filter((page) => !used.has(page.rel))
    .sort((a, b) => a.rel.localeCompare(b.rel, "pt-BR"))
    .map((page) => take(page.rel))
    .filter(Boolean);

  return { main, brands, guides, others };
}

/* ------------------------------------------------------------------ */
/* Montagem do arquivo                                                 */
/* ------------------------------------------------------------------ */

function entry(page, url = page.canonical) {
  const label = labelFor(page);
  const description = sentence(page.description);
  return `- [${label}](${url})${description ? `: ${description}` : ""}`;
}

function build() {
  const { main, brands, guides, others } = buildEntries();
  const services = serviceAnchors();
  const lines = [];

  lines.push("# NOTEDEBOOKPRO");
  lines.push("");
  lines.push(
    "> Assistência técnica especializada em notebooks em São Paulo, com diagnóstico eletrônico, reparo de placa-mãe, retrabalho BGA, reparo de vídeo, conector de carga, manutenção preventiva e upgrade."
  );
  lines.push("");
  lines.push(
    "A NOTEDEBOOKPRO atende notebooks Dell, HP, Lenovo, Acer, ASUS, Samsung, Avell e MSI em São Paulo — SP. O atendimento presencial é feito com agendamento na Vila Santo Estefano, zona sul da cidade. Todo reparo é precedido de diagnóstico técnico e orçamento aprovado pelo cliente."
  );
  lines.push("");
  lines.push("Dados oficiais:");
  lines.push("");
  lines.push("- Nome: NOTEDEBOOKPRO");
  lines.push("- Endereço: R. José da Rocha Mendes Filho, 42 — Vila Santo Estefano, São Paulo — SP, 04153-090");
  lines.push("- Telefone e WhatsApp: (11) 98311-2985 (+55 11 98311-2985)");
  lines.push("- E-mail: contato@notedebookpro.com.br");
  lines.push("- Horário: segunda a sexta, 10h às 19h; sábado, 10h às 15h");
  lines.push("- Área atendida: São Paulo — SP, com atendimento presencial agendado");
  lines.push("- Instagram: https://www.instagram.com/notedebookpro");
  lines.push("- Google: https://share.google/nBmNjDC6KhPjGCNu9");
  lines.push("- Google Maps: https://maps.app.goo.gl/u78CFtdxXBtTxz5AA");
  lines.push("");

  lines.push("## Páginas principais");
  lines.push("");
  for (const page of main) lines.push(entry(page));
  lines.push("");

  if (services.length) {
    lines.push("## Serviços detalhados");
    lines.push("");
    for (const service of services) {
      lines.push(
        `- [${service.heading}](${BASE}/servicos#${service.id}): ${sentence(service.paragraph)}`
      );
    }
    lines.push("");
  }

  if (brands.length) {
    lines.push("## Marcas atendidas");
    lines.push("");
    for (const page of brands) lines.push(entry(page));
    lines.push("");
  }

  if (guides.length) {
    lines.push("## Guias técnicos");
    lines.push("");
    for (const page of guides) lines.push(entry(page));
    lines.push("");
  }

  if (others.length) {
    lines.push("## Outras páginas");
    lines.push("");
    for (const page of others) lines.push(entry(page));
    lines.push("");
  }

  lines.push("## Optional");
  lines.push("");
  lines.push(`- [Sitemap XML](${BASE}/sitemap.xml): lista completa de URLs indexáveis do site.`);
  lines.push(`- [robots.txt](${BASE}/robots.txt): diretivas de rastreamento.`);
  lines.push(
    "- [Perfil no Google Maps](https://maps.app.goo.gl/u78CFtdxXBtTxz5AA): endereço, mapa e avaliações exibidas pelo Google."
  );
  lines.push("");

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

/* ------------------------------------------------------------------ */
/* Execução                                                            */
/* ------------------------------------------------------------------ */

const content = build();
const current = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : "";

if (CHECK) {
  const normalize = (text) => text.replace(/\r\n/g, "\n").trim();
  if (normalize(current) === normalize(content)) {
    console.log(`llms.txt em sincronia (${pages.length} páginas indexáveis).`);
    process.exit(0);
  }
  console.error("llms.txt desatualizado. Rode: node tools/build-llms.mjs");
  process.exit(1);
}

fs.writeFileSync(OUT_FILE, content, "utf8");
console.log(`llms.txt gerado com ${pages.length} páginas indexáveis.`);
