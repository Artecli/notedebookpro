#!/usr/bin/env node
/**
 * Servidor estático local que emula as regras do `.htaccess` de produção.
 *
 *   /index.html        -> 301 /
 *   /pasta/index.html  -> 301 /pasta/
 *   /pagina.html       -> 301 /pagina        (404.html é exceção)
 *   /pagina/           -> 301 /pagina        (quando não é diretório)
 *   /pagina            -> serve pagina.html  (rewrite interno, sem mudar a URL)
 *   /blog/             -> serve blog/index.html
 *   /blog              -> 301 /blog/
 *
 * Uso: node tools/serve.mjs [porta]
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PORT = Number(process.argv[2] || process.env.PORT || 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const isFile = (target) => existsSync(target) && statSync(target).isFile();
const isDir = (target) => existsSync(target) && statSync(target).isDirectory();

/** Impede que `..` escape da raiz do site. */
const inside = (urlPath) => {
  const target = normalize(join(ROOT, urlPath));
  return target === ROOT || target.startsWith(ROOT + sep) ? target : null;
};

createServer((req, res) => {
  const [rawPath, query] = req.url.split("?");
  const urlPath = decodeURIComponent(rawPath);
  const suffix = query ? `?${query}` : "";

  const redirect = (to) => {
    res.writeHead(301, { Location: to + suffix });
    res.end();
  };

  const send = (target, status = 200) => {
    res.writeHead(status, {
      "Content-Type": TYPES[extname(target).toLowerCase()] || "application/octet-stream"
    });
    if (req.method === "HEAD") return res.end();
    createReadStream(target).pipe(res);
  };

  const notFound = () => {
    const page = join(ROOT, "404.html");
    if (isFile(page)) return send(page, 404);
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404");
  };

  // /index.html e /pasta/index.html
  if (/(^|\/)index\.html$/.test(urlPath)) {
    return redirect(urlPath.replace(/index\.html$/, ""));
  }

  // /pagina.html -> /pagina (o 404 precisa manter a extensão)
  if (/\.html$/.test(urlPath) && urlPath !== "/404.html") {
    return redirect(urlPath.replace(/\.html$/, ""));
  }

  const file = inside(urlPath);
  if (!file) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("403");
  }

  if (isFile(file)) return send(file);

  if (isDir(file)) {
    if (!urlPath.endsWith("/")) return redirect(`${urlPath}/`);
    const index = join(file, "index.html");
    return isFile(index) ? send(index) : notFound();
  }

  // /pagina/ -> /pagina quando não existe o diretório
  if (urlPath !== "/" && urlPath.endsWith("/")) {
    return redirect(urlPath.replace(/\/+$/, ""));
  }

  // URL sem extensão -> arquivo .html
  if (!extname(file) && isFile(`${file}.html`)) return send(`${file}.html`);

  notFound();
}).listen(PORT, () => {
  console.log(`NOTEDEBOOKPRO em http://localhost:${PORT} (regras do .htaccess)`);
});
