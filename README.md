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

A seção de avaliações **não contém depoimentos, notas ou números inventados**. Ela direciona para o perfil oficial da empresa no Google Maps:

```js
googleReviews: "https://www.google.com/maps/place/NOTEDEBOOKPRO+Assist%C3%AAncia+T%C3%A9cnica+Notebook/@-23.6278275,-46.6275078,17z/data=!3m1!4b1!4m6!3m5!1s0x94ce5b03f3082e61:0xbb389266ebc936fd!8m2!3d-23.6278275!4d-46.6275078!16s%2Fg%2F11cspb701c"
```

O HTML não reproduz notas, números nem depoimentos. Para exibi-los no site, use um widget oficial ou depoimentos reais autorizados.

## SEO

- `title` e `meta description` únicos por página
- `canonical` absoluto
- Open Graph e Twitter Card
- JSON-LD: `LocalBusiness` com `PostalAddress`, `GeoCoordinates` e `hasMap`; `Service`, `Blog`, `BlogPosting`, `BreadcrumbList`, `FAQPage` e `ContactPage`
- Hierarquia H1 → H2 → H3
- Links internos entre serviços, artigos e contato
- `sitemap.xml` e `robots.txt`
- `404.html` com `noindex`

Ao publicar em um domínio diferente, atualize as URLs absolutas em `sitemap.xml`, `robots.txt`, `canonical`, Open Graph e JSON-LD.

## Performance e imagens

- Imagens em AVIF/WebP com fallback, `width`/`height` explícitos, `loading="lazy"` e `fetchpriority` no hero
- Fonte Inter self-hosted com `preload` e `font-display: swap`
- CSS e JS locais, sem bibliotecas de terceiros
- JavaScript mínimo e progressivo (menu, FAQ, revelações e formulário)

As fotos atuais são de banco de imagens (macros de placa-mãe com tratamento azul). Substitua por fotos reais da bancada, da equipe e dos equipamentos quando estiverem disponíveis, mantendo os mesmos nomes de arquivo para não quebrar o HTML — ou gere WebP/AVIF nos mesmos tamanhos.

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
- Não há cookies de rastreamento nem analytics por padrão. Se adicionar, atualize a Política de Privacidade e implemente consentimento quando necessário.
