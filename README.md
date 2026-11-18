# NOTEDEBOOKPRO — site institucional

Site estático (HTML, CSS e JavaScript puro) para a NOTEDEBOOKPRO, assistência técnica de notebooks em São Paulo. Não depende de WordPress, build step ou framework: basta publicar a pasta inteira em qualquer hospedagem estática.

## Estrutura

```
/
├─ index.html                 Home
├─ servicos.html              Serviços e detalhes técnicos
├─ sobre.html                 Sobre a assistência
├─ contato.html               Contato e formulário → WhatsApp
├─ blog/
│  ├─ index.html              Índice do blog
│  └─ <slug>.html             7 artigos técnicos
├─ assistencia-tecnica-notebook-*/
│  └─ index.html              19 páginas de marca: 10 marcas (Dell, HP, Lenovo, Acer, ASUS, Samsung, Avell, MSI, VAIO e Compaq) + 9 linhas gamer/workstation
├─ assistencia-tecnica-notebook-*/
│  └─ index.html              27 páginas de bairro/região (Zona Sul, Centro e Zona Oeste) — links na seção #regioes da home
├─ privacidade.html           Política de Privacidade (LGPD)
├─ 404.html                   Página de erro
├─ .htaccess                  HTTPS, www, remoção de .html e rewrite interno (Apache)
├─ robots.txt
├─ sitemap.xml
├─ llms.txt                   Índice para agentes de IA (gerado)
├─ tools/
│  ├─ build-llms.mjs          Gera/valida o llms.txt a partir do HTML
│  ├─ check-gtm.mjs           Confere o snippet do Google Tag Manager nas páginas
│  └─ serve.mjs               Servidor local que emula o .htaccess
└─ assets/
   ├─ css/styles.css          Design system e estilos de todas as páginas
   ├─ js/site.js              Configuração, menu, FAQ, revelações e formulário
   ├─ fonts/                  Inter variável (self-hosted)
   └─ img/                    Imagens otimizadas em WebP/AVIF + OG image
```

## Pré-visualização local

O site é HTML estático, mas os links internos não têm `.html`. Um servidor que apenas entrega arquivos (como `python -m http.server`) devolve **404 em `/servicos`**. Use o servidor do repositório, que emula as regras do `.htaccess`:

```powershell
node tools/serve.mjs        # http://localhost:4173
node tools/serve.mjs 8080   # outra porta
```

Ele aplica os mesmos 301 de produção (`/servicos.html` → `/servicos`, `/index.html` → `/`), serve `/blog/` a partir de `blog/index.html` e resolve `/servicos` por rewrite interno. Se usar outra ferramenta, confirme que ela resolve URL sem extensão — se `/servicos` der 404, não é o servidor certo para testar o site.

## URLs e canonicalização (Apache)

Cada página tem **uma única URL pública, sem `.html`**. O arquivo continua `.html` no disco; quem remove a extensão é o servidor.

| Arquivo no disco | URL pública |
|---|---|
| `index.html` | `/` |
| `servicos.html` | `/servicos` |
| `sobre.html` | `/sobre` |
| `contato.html` | `/contato` |
| `privacidade.html` | `/privacidade` |
| `blog/index.html` | `/blog/` |
| `blog/<slug>.html` | `/blog/<slug>` |
| `assistencia-tecnica-notebook-<marca>/index.html` | `/assistencia-tecnica-notebook-<marca>/` |

`canonical`, `og:url`, `sitemap.xml`, `llms.txt` e todos os links internos usam essa forma. Nenhum `href` do site aponta para `.html`.

O `.htaccess` na raiz faz o trabalho no Apache (Hostinger):

1. `http` → `https` (301).
2. domínio sem `www` → `https://www.notedebookpro.com.br` (301).
3. `/index.html` → `/` e `/pasta/index.html` → `/pasta/` (301).
4. `/pagina.html` → `/pagina` (301). A exceção é `/404.html`, que precisa da extensão para o `ErrorDocument`.
5. `/pagina/` → `/pagina` quando não existe o diretório (301) — evita 500/404 com barra sobrando.
6. `/pagina` → serve `pagina.html` por dentro, sem mudar a barra de endereços.

Como conferir depois do upload:

```bash
curl -I https://www.notedebookpro.com.br/servicos        # 200
curl -I https://www.notedebookpro.com.br/servicos.html   # 301 → /servicos
curl -I https://www.notedebookpro.com.br/servicos/       # 301 → /servicos
curl -I https://www.notedebookpro.com.br/index.html      # 301 → /
curl -I https://www.notedebookpro.com.br/blog/           # 200
curl -I http://notedebookpro.com.br/servicos             # 301 → https://www...
```

**Cloudflare:** o site está atrás do proxy, então o TLS termina na borda e o `http → https` do visitante é feito pelo *Always Use HTTPS* do Cloudflare. A regra 1 do `.htaccess` só age quando a requisição **não** passa pelo Cloudflare (`CF-Connecting-IP` ausente) — assim não há loop caso o SSL do Cloudflare esteja em *Flexible*. Depois de subir o arquivo, limpe o cache do Cloudflare: o HTML fica até 1 hora no edge.

**Antes de subir:** se a raiz da hospedagem já tem um `.htaccess` (cache, hotlink, `php.ini`, bloqueios), **mescle** essas regras no arquivo existente em vez de sobrescrever — o Apache só lê um `.htaccess` por pasta.

Para reverter, apague o `.htaccess`: o site volta a responder em `/servicos.html` (este host também resolve `/servicos` por MultiViews, mas sem os 301, o que cria URLs duplicadas).

Em hospedagens que não leem `.htaccess` (Netlify, Vercel, Cloudflare Pages), o HTML não muda: a URL limpa é configurada pela própria plataforma (no caso da Vercel, `cleanUrls: true` no `vercel.json`).

## Marcas e linhas gamer

São 19 páginas de marca, todas em `/assistencia-tecnica-notebook-<slug>/`:

- **Marcas** (10): Dell, HP, Lenovo, Acer, ASUS, Samsung, Avell, MSI, VAIO e Compaq.
- **Linhas gamer e workstation** (9): Alienware, Razer Blade, Gigabyte/AORUS, Lenovo Legion, HP OMEN, ASUS ROG, Eluktronics, Acer Predator e Acer Nitro.

Cada página tem hero com o wordmark da marca, introdução, chips das linhas atendidas, o bloco **"Características de cada família"** (`<dl class="brand-families">`, com o que muda de projeto para projeto), texto técnico com link para um guia do blog e três dúvidas frequentes. No fim, "Outras marcas e linhas" mostra no máximo 8 páginas relacionadas — 5 do mesmo grupo e 3 do outro —, para não inflar a malha de links.

Na home, a grade de marcas tem 12 células em 4 colunas no desktop (3 no tablet e 2 no celular): as 10 marcas, a célula **"Outras marcas"** e a célula **"Modelos gamer"**, que leva à seção `#gamer`, com as 9 linhas em `.brand-cross--five` (5 colunas no desktop, 2 no tablet e 1 no celular).

## Bairros e regiões

São **27 páginas locais**, todas em `/assistencia-tecnica-notebook-<bairro>/`, com o mesmo prefixo das páginas de marca:

- **Zona Sul** (24): página-guia da região, Vila Mariana, Vila Moraes, Vila Carioca, Santa Cruz, Sacomã, Paraíso, Moinho Velho, Moema, Jardim Maria Estela, Vila Liviero, Dom Vilares, Chácara Klabin, Vila Clementino, São João Clímaco, Jabaquara, Ipiranga, Indianópolis, Bosque da Saúde, Saúde, Praça da Árvore, Chácara Flora, Ibirapuera e Campo Belo.
- **Centro** (2): Aclimação e Bela Vista.
- **Zona Oeste** (1): Pinheiros.

Cada página tem `Service` com `areaServed` no bairro, `BreadcrumbList`, `FAQPage`, introdução com referências reais de acesso (metrô, avenidas, parques), sintomas que justificam avaliação, "Bairros e regiões próximos" e três dúvidas frequentes. Nenhuma página afirma atendimento em domicílio: o atendimento presencial é na bancada, com agendamento.

A seção **`#regioes` da home** (não fica no menu) reúne um **mapa esquemático em SVG** (sem iframe e sem escala), os dados de atendimento e um botão para cada bairro, agrupados por região. Cada pino do mapa aponta para a página do bairro e fica ligado ao botão correspondente por `data-region`: ao passar o mouse ou focar um botão, o pino se realça, e vice-versa. O SVG é decorativo (`aria-hidden`) e tem `tabindex="-1"` nos links, de modo que a navegação acessível são os botões. O mapa real, com o Google Maps incorporado, fica em `/contato`. É o ponto de entrada da malha de links locais: cada página de bairro aponta de volta para `/#regioes`.

Como bairros e marcas compartilham o prefixo `assistencia-tecnica-notebook-`, o `tools/build-llms.mjs` mantém a lista `REGION_SLUGS` para separar as duas seções no `llms.txt`. Ao criar uma página local nova, acrescente o slug nessa lista.

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
- `canonical` absoluto e `og:url` sempre na URL sem `.html`
- Uma URL por página: `.html` redireciona com 301 para a forma curta (ver [URLs e canonicalização](#urls-e-canonicalização-apache))
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
- Artigos (`blog/*.html`) entram em *Guias técnicos*, na ordem em que aparecem no `blog/index.html`.
- Serviços com âncora em `servicos.html` entram em *Serviços detalhados*.
- Qualquer outra página indexável cai em *Outras páginas* até receber uma regra própria.

Fluxo ao criar uma página: adicione o HTML com `title`, `meta description`, `canonical` e `robots` indexável, inclua o link no menu/blog/sitemap e rode `node tools/build-llms.mjs`.

Se algo estiver fora do lugar, ajuste `MAIN_ORDER`, `LABELS` ou as regras de seção no topo de `tools/build-llms.mjs`.

Para expor o conteúdo completo (e não só o índice), a convenção prevê um `llms-full.txt` opcional — não incluído por enquanto, para não duplicar o HTML em um segundo arquivo que precisaria de manutenção própria.

Observação: o `llms.txt` é uma convenção emergente para agentes e crawlers de IA. O Google Search **não** o utiliza como sinal de indexação — para o Google, o que vale é `robots.txt`, `sitemap.xml`, `canonical`, links internos e conteúdo no HTML.

## Performance e imagens

- Imagens em AVIF/WebP com fallback, `width`/`height` explícitos, `loading="lazy"` e `fetchpriority` no hero
- Fonte Inter self-hosted com `preload` e `font-display: swap`
  - junto dela vai um `@font-face` **"Inter Fallback"** (Arial/Helvetica) calibrado com `size-adjust` e `ascent/descent-override` para ocupar exatamente a mesma largura e altura de linha da Inter. Sem isso, a troca da fonte ao carregar gerava **CLS de ~0,24 no desktop**; com o fallback calibrado o CLS fica em 0 (medido com a fonte atrasada em 2,5 s)
- CSS e JS locais, sem bibliotecas de terceiros — a única exceção é o contêiner do Google Tag Manager (`GTM-MXJTWR`), usado para medição
- JavaScript mínimo e progressivo (menu, FAQ, revelações e formulário)
- Cache do navegador definido no `.htaccess`: HTML `no-cache`/revalidação, CSS e JS por 30 dias, imagens por 6 meses e fontes por 1 ano (`immutable`), além de gzip/deflate na origem. Ao trocar uma imagem mantendo o mesmo nome, ela pode demorar até 6 meses para atualizar — prefira renomear o arquivo

As fotos atuais são de banco de imagens (macros de placa-mãe com tratamento azul). Substitua por fotos reais da bancada, da equipe e dos equipamentos quando estiverem disponíveis, mantendo os mesmos nomes de arquivo para não quebrar o HTML — ou gere WebP/AVIF nos mesmos tamanhos.

## Analytics (Google Tag Manager)

O site carrega o contêiner **GTM-MXJTWR** em todas as páginas, em duas variantes:

- **59 páginas geradas** (`gen-layout.mjs` → função `page()`, logo após `<meta name="viewport">`): loader estático, como no snippet oficial;
- **home (`index.html`)**: loader **diferido**, que só injeta o `gtm.js` depois de 5 s ou da primeira interação do usuário.

Além do loader no `<head>`, cada página tem o fallback `<noscript>` com o iframe do GTM logo após `<body>`, como recomenda o Google. `node tools/check-gtm.mjs` verifica as 60 páginas: loader único (estático ou diferido), dentro do `<head>`, `dataLayer` inicializado, evento `gtm.js` com `gtm.start`, nenhum resquício de `gtag()` e `<noscript>` no `<body>`; no fim, lista as páginas com carregamento diferido.

```html
<!-- Google Tag Manager -->
<script>
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
</script>
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-MXJTWR"></script>
```

Essa é a variante "explícita" do snippet oficial do Google: inicializa o `dataLayer` e envia `gtm.js` com o timestamp `gtm.start`, que é o que ordena os disparos dentro do contêiner. O snippet canônico do painel faz o mesmo em uma linha só (IIFE que injeta o script); escolhemos a forma explícita porque deixa o `dataLayer` visível no HTML e dispensa `document.write`/injeção.

### Home: carregamento diferido

A home não usa o bloco acima. Ela carrega o contêiner **depois de 5 segundos ou da primeira interação** (`mousemove`, `keydown`, `scroll`, `touchstart` ou `click`), para o download do GTM não competir com o LCP da página:

- `loadGTM()` inicializa o `dataLayer`, envia `gtm.js` com `gtm.start` e injeta o `<script>` do GTM no `<head>`;
- `window.gtmLoaded` garante carregamento único, mesmo que vários eventos disparem juntos;
- o `setTimeout` de `autoLoadDuration` (5 s) é a rede de segurança para visitas sem interação;
- no primeiro gatilho, o timeout é cancelado e os listeners são removidos.

```html
<!-- Google Tag Manager -->
<script>
  const autoLoadDuration = 5; // segundos

  function loadGTM() {
    if (window.gtmLoaded) return;
    window.gtmLoaded = true;

    window.dataLayer = window.dataLayer || [];
    dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-MXJTWR';

    document.head.appendChild(gtmScript);
  }

  const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
  const timeout = setTimeout(loadGTM, autoLoadDuration * 1000);

  function triggerLoad() {
    clearTimeout(timeout);
    loadGTM();
    events.forEach((event) => window.removeEventListener(event, triggerLoad));
  }

  events.forEach((event) =>
    window.addEventListener(event, triggerLoad, { passive: true })
  );
</script>
```

**Impacto na medição:** o `page_view` da home só é enviado depois desses 5 s (ou do primeiro sinal de interação). Visitas que fecham a aba antes disso não entram no GA4, e a sessão começa mais tarde. As 21 páginas internas continuam carregando o GTM imediatamente. Para reverter a home ao carregamento imediato, basta trocar o bloco pelo snippet estático das demais páginas e rodar `node tools/check-gtm.mjs`.

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
2. Rode `node tools/serve.mjs` e teste todas as páginas em desktop e celular.
3. Envie a pasta para a hospedagem (Netlify, Vercel, Cloudflare Pages, Hostinger etc.), **incluindo o `.htaccess`** e a pasta `blog/`.
4. Configure `404.html` como página de erro personalizada no painel da hospedagem.
5. Depois do upload, confira as URLs com `curl -I` (seção [URLs e canonicalização](#urls-e-canonicalização-apache)): `/servicos` responde 200, `/servicos.html` responde 301, `http://` e domínio sem `www` redirecionam.
6. Com o site atrás do Cloudflare, **purge o cache** depois de cada envio (Caching → Configuration → Purge Everything) e confira os cabeçalhos com `curl -I https://www.notedebookpro.com.br/assets/css/styles.css`: deve vir `cache-control: public, max-age=2592000` e `content-encoding: br`/`gzip`. Sem o purge, o HTML antigo pode continuar sendo servido na borda mesmo com o `.htaccess` novo.
7. Envie o `sitemap.xml` no Google Search Console (as URLs mudaram de `.html` para a forma curta) e confirme o `robots.txt`.
8. Valide o schema em [validator.schema.org](https://validator.schema.org/) e os dados em [search.google.com/test/rich-results](https://search.google.com/test/rich-results).

## Observações

- O menu mobile, o FAQ e o formulário funcionam sem dependências.
- O site respeita `prefers-reduced-motion`.
- Não há cookies de rastreamento além dos gerados pelo Google Tag Manager. A Política de Privacidade descreve o uso; se o cenário exigir consentimento prévio, use o *Consent Mode* no GTM.
