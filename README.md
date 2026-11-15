# NOTEDEBOOKPRO — site institucional

Site estático (HTML, CSS e JavaScript puro) para a NOTEDEBOOKPRO, assistência técnica de notebooks em São Paulo. Não depende de WordPress, build step ou framework: basta publicar a pasta inteira em qualquer hospedagem estática.

## Estrutura

```
/
├─ index.html                 Home
├─ servicos.html              Serviços e detalhes técnicos
├─ sobre.html                 Sobre a assistência
├─ contato.html               Contato e formulário → WhatsApp
├─ blog.html                  Índice do blog
├─ blog/                      7 artigos técnicos
├─ assistencia-tecnica-notebook-*/  8 páginas de marca (Dell, HP, Lenovo, Acer, ASUS, Samsung, Avell e MSI)
├─ privacidade.html           Política de Privacidade (LGPD)
├─ 404.html                   Página de erro
├─ robots.txt
├─ sitemap.xml
├─ llms.txt                   Índice para agentes de IA (gerado)
├─ tools/
│  ├─ build-llms.mjs          Gera/valida o llms.txt a partir do HTML
│  └─ check-gtm.mjs           Confere o snippet do Google Tag Manager nas páginas
└─ assets/
   ├─ css/styles.css          Design system e estilos de todas as páginas
   ├─ js/site.js              Configuração, menu, FAQ, revelações e formulário
   ├─ fonts/                  Inter variável (self-hosted)
   └─ img/                    Imagens otimizadas em WebP/AVIF + OG image
```

## Pré-visualização local

Como o site usa caminhos relativos e `fetch` não é necessário, qualquer servidor estático funciona. Exemplos:

```powershell
# Python
python -m http.server 4173

# Node (npx)
npx serve .
```

Abra `http://localhost:4173`.

> Abrir `index.html` diretamente pelo sistema de arquivos funciona, mas um servidor local reproduz melhor o comportamento de produção.

## Dados de contato

Os dados principais já estão configurados:

| Dado | Valor | Onde aparece |
|---|---|---|
| WhatsApp | `(11) 98311-2985` | `assets/js/site.js`, links `wa.me`, `tel:`, rodapé e schema |
| E-mail | `contato@notedebookpro.com.br` | HTML, `site.js`, schema e política de privacidade |
| Endereço | `R. José da Rocha Mendes Filho, 42 — Vila Santo Estefano, São Paulo — SP, 04153-090` | Rodapé, contato, mapa e schema `PostalAddress` |
| Horário | Segunda a sexta, 10h às 19h · Sábado, 10h às 15h | Rodapé, contato e schema |
| Instagram | `https://www.instagram.com/notedebookpro` | Rodapé e schema `sameAs` |
| Google | `https://share.google/nBmNjDC6KhPjGCNu9` | Ícone no rodapé ao lado do Instagram |
| Google Maps | `https://maps.app.goo.gl/u78CFtdxXBtTxz5AA` | Links de endereço, botão do mapa e schema `hasMap` |
| Domínio | `https://www.notedebookpro.com.br` | `canonical`, Open Graph, schema, `robots.txt` e `sitemap.xml` |

O endereço e as coordenadas (`-23.6278275, -46.6275078`) vêm do perfil da empresa no Google Maps. O mapa incorporado usa essas coordenadas em modo mapa, com `loading="lazy"`, e o `place ID` `0x94ce5b03f3082e61:0xbb389266ebc936fd` identifica o perfil nos links e no schema.

O bloco `SITE` no início de `assets/js/site.js` centraliza WhatsApp, e-mail, endereço, cidade, horário, Instagram, Google e Maps em tempo de execução. Como o HTML e o JSON-LD são estáticos, ao alterar qualquer dado atualize também os fallbacks no HTML e o schema para manter o funcionamento sem JavaScript e o SEO.

## Formulário de contato

O formulário não envia dados para servidor. Ao enviar, o `site.js` valida os campos e abre o WhatsApp com uma mensagem pré-preenchida (nome, modelo, serviço e descrição). Nenhum dado é armazenado pelo site.

## Avaliações e prova social

A seção de avaliações do `index.html` exibe a **nota média, as 5 estrelas e o total de avaliações do perfil oficial da empresa no Google**, com link para o perfil. Nada é inventado: os valores vêm do Google Maps e o site não reproduz depoimentos, nomes nem avaliações individuais.

```js
googleReviews: "https://www.google.com/maps/place/NOTEDEBOOKPRO+Assist%C3%AAncia+T%C3%A9cnica+Notebook/@-23.6278275,-46.6275078,17z/data=!3m1!4b1!4m6!3m5!1s0x94ce5b03f3082e61:0xbb389266ebc936fd!8m2!3d-23.6278275!4d-46.6275078!16s%2Fg%2F11cspb701c"
```

O bloco é um **retrato estático** (snapshot) do perfil, sem JavaScript nem API paga:

| Campo no HTML | Valor atual | Onde fica |
|---|---|---|
| `.review-value` | `4,9` | nota média |
| `.review-stars` (SVG) | 4 estrelas cheias + 1 a 90% | `linearGradient#review-star-partial` |
| `.review-count` | `281 avaliações` | total no Google |
| `.review-note` | `novembro de 2026` | data da conferência |

Para atualizar: confira a nota e o total no perfil do Google Maps, ajuste os três valores acima e a data em `.review-note`. Se a nota mudar de décima, ajuste também o `offset` final do gradiente (`0.9` = 90% da quinta estrela) e o `aria-label` de `.review-stars`.

O `aggregateRating` **não** é incluído no JSON-LD de propósito: as diretrizes do Google restringem a marcação de avaliações agregadas de terceiros, e a nota continua visível no HTML com link para a fonte.

## SEO

- `title` e `meta description` únicos por página
- `canonical` absoluto
- Open Graph e Twitter Card
- JSON-LD: `LocalBusiness` com `PostalAddress`, `GeoCoordinates` e `hasMap`; `Service`, `Blog`, `BlogPosting`, `BreadcrumbList`, `FAQPage` e `ContactPage`
- Hierarquia H1 → H2 → H3
- Links internos entre serviços, artigos e contato
- `sitemap.xml` e `robots.txt`
- `404.html` com `noindex`
- `llms.txt` na raiz, com resumo do negócio, dados oficiais e índice das páginas para agentes de IA

Ao publicar em um domínio diferente, atualize as URLs absolutas em `sitemap.xml`, `robots.txt`, `canonical`, Open Graph e JSON-LD.

## llms.txt (descoberta por IA)

O arquivo `llms.txt` segue a convenção de [llmstxt.org](https://llmstxt.org/): título, resumo em blockquote, dados oficiais da empresa e listas de links com descrição, agrupadas por seção (`Páginas principais`, `Serviços detalhados`, `Marcas atendidas`, `Guias técnicos`, `Optional`).

Ele é **gerado a partir do HTML**, não escrito à mão. Cada entrada usa o `canonical`, o H1 e a `meta description` da própria página, então o conteúdo do índice nunca diverge do site.

```bash
node tools/build-llms.mjs          # regenera llms.txt
node tools/build-llms.mjs --check  # falha se estiver desatualizado
```

**Regra do projeto:** toda página nova indexável precisa aparecer no `llms.txt`.

- Páginas de marca (`assistencia-tecnica-notebook-<marca>/`) entram automaticamente na seção *Marcas atendidas*.
- Artigos (`blog/*.html`) entram em *Guias técnicos*, na ordem em que aparecem no `blog.html`.
- Serviços com âncora em `servicos.html` entram em *Serviços detalhados*.
- Qualquer outra página indexável cai em *Outras páginas* até receber uma regra própria.

Fluxo ao criar uma página: adicione o HTML com `title`, `meta description`, `canonical` e `robots` indexável, inclua o link no menu/blog/sitemap e rode `node tools/build-llms.mjs`.

Se algo estiver fora do lugar, ajuste `MAIN_ORDER`, `LABELS` ou as regras de seção no topo de `tools/build-llms.mjs`.

Para expor o conteúdo completo (e não só o índice), a convenção prevê um `llms-full.txt` opcional — não incluído por enquanto, para não duplicar o HTML em um segundo arquivo que precisaria de manutenção própria.

Observação: o `llms.txt` é uma convenção emergente para agentes e crawlers de IA. O Google Search **não** o utiliza como sinal de indexação — para o Google, o que vale é `robots.txt`, `sitemap.xml`, `canonical`, links internos e conteúdo no HTML.

## Performance e imagens

- Imagens em AVIF/WebP com fallback, `width`/`height` explícitos, `loading="lazy"` e `fetchpriority` no hero
- Fonte Inter self-hosted com `preload` e `font-display: swap`
- CSS e JS locais, sem bibliotecas de terceiros — a única exceção é o contêiner do Google Tag Manager (`GTM-MXJTWR`), usado para medição
- JavaScript mínimo e progressivo (menu, FAQ, revelações e formulário)

As fotos atuais são de banco de imagens (macros de placa-mãe com tratamento azul). Substitua por fotos reais da bancada, da equipe e dos equipamentos quando estiverem disponíveis, mantendo os mesmos nomes de arquivo para não quebrar o HTML — ou gere WebP/AVIF nos mesmos tamanhos.

## Analytics (Google Tag Manager)

O site carrega o contêiner **GTM-MXJTWR** em todas as páginas. O snippet fica em dois lugares:

- `gen-layout.mjs` → função `page()`, logo após `<meta name="viewport">` — vale para as 21 páginas geradas;
- `index.html` → bloco equivalente no `<head>`, porque a home não passa pelo gerador.

Além do carregador no `<head>`, cada página tem o fallback `<noscript>` com o iframe do GTM logo após `<body>`, como recomenda o Google. `node tools/check-gtm.mjs` verifica as 22 páginas: loader único, dentro do `<head>`, `dataLayer` inicializado, evento `gtm.js` com `gtm.start`, nenhum resquício de `gtag()` e `<noscript>` no `<body>`.

```html
<!-- Google Tag Manager -->
<script>
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
</script>
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-MXJTWR"></script>
```

Essa é a variante "explícita" do snippet oficial do Google: inicializa o `dataLayer` e envia `gtm.js` com o timestamp `gtm.start`, que é o que ordena os disparos dentro do contêiner. O snippet canônico do painel faz o mesmo em uma linha só (IIFE que injeta o script); escolhemos a forma explícita porque deixa o `dataLayer` visível no HTML e dispensa `document.write`/injeção.

Dois detalhes que valem para quem for mexer:

- **O evento `gtm.js` é obrigatório.** É ele que dispara o acionador *Page view* / *All Pages*. Sem esse evento, tags criadas com esse acionador nunca rodam.
- **Não use `function gtag(){dataLayer.push(arguments)}` aqui.** Esse trecho pertence ao `gtag.js`, não ao GTM: ele empurra um objeto `Arguments` para o `dataLayer`, que o contêiner ignora e que aparece como "Arguments" no Preview. `gtag()` só é necessário se o site passar a carregar `gtag.js` direto (por exemplo `https://www.googletagmanager.com/gtag/js?id=G-...`).

O contêiner publicado hoje carrega GA4 (`G-MXDZ5R5CJ3`) e uma tag do Google Ads (`GT-NSKC8ZZL`); o GA4 envia *page view* pelo próprio contêiner.

Para medir no GTM, confira em [tagmanager.google.com](https://tagmanager.google.com/):

1. Tag **Google Analytics: GA4 – Configuração** com o ID de métricas.
2. Tag **GA4 – Evento** com *Page view* e acionador *All Pages*.
3. Acionadores de clique em links `wa.me`, `mailto:` e no botão de avaliações, se quiser medir contato.
4. Publique a versão do contêiner — sem publicar, nada é enviado.

A Política de Privacidade (`privacidade.html`, seção 4) descreve o uso de cookies, GA4 e Google Ads, com link para as políticas e para o My Ad Center. Não há banner de consentimento: se o site for operar em cenário que exija consentimento prévio (por exemplo, tráfego da União Europeia ou exigência do controlador), ative o *Consent Mode* no GTM e condicione as tags de analytics e de ads a ele.

## Publicação

1. Confirme os dados de contato e defina o endereço/bairro e o link do Google Business Profile.
2. Rode um servidor local e teste todas as páginas em desktop e celular.
3. Envie a pasta para a hospedagem (Netlify, Vercel, Cloudflare Pages, Hostinger etc.).
4. Configure `404.html` como página de erro personalizada no painel da hospedagem.
5. Envie o `sitemap.xml` no Google Search Console e confirme o `robots.txt`.
6. Valide o schema em [validator.schema.org](https://validator.schema.org/) e os dados em [search.google.com/test/rich-results](https://search.google.com/test/rich-results).

## Observações

- O menu mobile, o FAQ e o formulário funcionam sem dependências.
- O site respeita `prefers-reduced-motion`.
- Não há cookies de rastreamento além dos gerados pelo Google Tag Manager. A Política de Privacidade descreve o uso; se o cenário exigir consentimento prévio, use o *Consent Mode* no GTM.
