# PRODUCT.md — Loja Agro Esporte Clube

## Register

mini-documentário que vende. A camisa é o primeiro artefato físico de uma
instituição que acabou de nascer, e a página inteira existe para provar
isso antes de pedir a compra. O comércio é direto quando chega, mas
nunca é o que abre a conversa.

## O que é

Landing page da campanha **Vista o Começo**, que vende a **Camisa 01 —
Edição Fundadora** (nome comercial: **Manto I 2027**) do Agro Esporte
Clube, de Catalão, Goiás. Headless em Shopify Hydrogen, no mesmo stack e
nas mesmas convenções do `cbv-storefront` (Voleishop / CBV).

Uma rota, um produto: `/` é a página do produto. `/products/:handle`
redireciona para o bloco de compra.

## Canon — nunca contradizer

| Dado | Valor |
| --- | --- |
| Clube | Agro Esporte Clube |
| Cidade / Estado | Catalão / Goiás |
| Fundação | 2026 |
| Primeira temporada | 2027 |
| Produto | Manto I 2027 |
| Campanha | Camisa 01 — Edição Fundadora |
| Fornecedor | VOLT Sport |
| Lema | FÉ · TRABALHO · LEGADO |
| Handle | `manto-i-2027` |

Nunca publicar "Goiânia". Nunca apresentar 2026 como temporada do Manto
I. Toda a copy de campanha vive em `app/lib/campaign-copy.js`; copy
técnica, FAQ, medidas e prazos vivem em `app/lib/manto.js`.

## Quem usa

Torcedor e produtor rural, no celular (390×844 é a base de projeto).
Chega por campanha, por Instagram ou por notícia da fusão ABECAT → Agro
Esporte Clube. Precisa decidir tamanho, modelagem e personalização em
poucos toques — mas a marca quer que ele se demore.

## Arquitetura narrativa

Três atos, onze capítulos e um epílogo comercial. A ordem é imutável.

| Ato | Capítulos | Componentes |
| --- | --- | --- |
| I — Origem | 00–03 | `IntroGate`, `SceneOriginLine`, `SceneHero`, `SceneFieldMorph`, `SceneBirthCertificate` |
| II — Símbolo | 04–07 | `SceneShieldAssembly`, `SceneShirtReveal`, `SceneShirtTurntable`, `SceneDetails` |
| III — História | 08–10 | `SceneStillEarly`, `SceneFinalStatement` |
| Epílogo | 11–13 | `Configurador`, `CommercialSupport`, `StickyBuyBar`, rodapé |

A vista frontal limpa da camisa é patrimônio do capítulo 06. Antes dela
só existem silhueta, costas, tecido e símbolo — o reveal só tem peso
porque a espera foi respeitada.

## Personalidade

Agro sem clichê rural: nada de western, boi, trator, madeira ou
verde-amarelo de propaganda. O agro aqui é lavoura à noite, ouro de sol
nascendo, disciplina de trabalho. O lema vive na etiqueta interna da
gola: **FÉ · TRABALHO · LEGADO / PRODUTOR RURAL**.

## Sistema visual

- Tipografia: **Archivo Narrow 700** (display, caixa alta, escala grande)
  + **Gelasio** (serifada, métrica compatível com Georgia — a dupla do
  mídia kit é Arial Narrow + Georgia).
- Cores lidas do render do manto: noite `#070b08`, noite-2 `#0b120d`,
  verde-campo `#16452a`, ouro `#c6a15b`, ouro-claro `#e3c489`, cobre
  `#d2a87f`, creme `#ebdcc2`, papel `#f4f1e7`.
- O bloco claro (certidão de nascimento) é obrigatório: sem ele a página
  inteira lê como marca financeira do agro.
- CSS em quatro camadas: `agro.css` (tokens e cromo), `campaign-motion.css`
  (primitivas e portões de motion), `campaign.css` (composição da
  campanha), `manto.css` (comércio, prefixo `mn-`).

## Motion

- Dependências fixas: `gsap` 3.15.0, `@gsap/react` 2.1.2, `lenis` 1.3.26.
  Sem Framer Motion, Locomotive ou Three.js.
- Registro do GSAP em `app/lib/gsap.js`, no import — efeitos de filho
  rodam antes dos do pai, então registrar dentro do provider chega tarde.
- `CampaignMotionProvider` é a ponte única Lenis ↔ ScrollTrigger. Uma
  instância para a página; cada cena traz a própria timeline com
  `useGSAP({scope, revertOnUpdate})`.
- O conteúdo **nasce visível**. Estado inicial escondido só existe sob
  `.motion-ready:not(.reduce-motion)`, e essa classe entra no `<html>` por
  script inline antes da primeira pintura. Sem JS, nada disso se aplica.
- Máscaras: o CSS esconde a linha com `translateY(108%)`; o GSAP converte
  esse percentual em px no canal `y`, que soma com `yPercent`. Toda cena
  chama `gsap.set('.mask-interna', {yPercent: 108, y: 0})` antes de montar
  a timeline para deixar a máscara num canal só.
- `prefers-reduced-motion` é lido de forma síncrona na primeira
  renderização (`useReducedMotion`) — senão as cenas montam pins que
  depois precisam ser desfeitos e deixam `position: fixed` para trás.
- `ScrollTrigger.refresh()` só depois de `document.fonts.ready` e do LCP
  decodificado, e em resize com debounce.
- Em desenvolvimento, `window.__ST` e `window.__LENIS` existem para o QA
  pular direto ao meio de uma cena pinada.

## Assets e pendências

Renders extraídos do `.fig` do mídia kit e reenquadrados para WebP em
`public/manto/`.

| Asset | Estado |
| --- | --- |
| Escudo segmentado (SVG com grupos) | **pendente** — cena 05 roda no fallback declarado: `escudo.webp` montado por máscara, luz e escala (`TODO(asset)` no componente) |
| Turntable 72 frames WebP com alpha | **pendente** — cena 07 roda em `data-motion-fallback="two-face"`; basta soltar os arquivos em `public/manto/turntable/manto-000.webp…071` que `useImageSequence` detecta e troca sozinho |
| Transformação lavoura → campo | **pronto** — SVG procedural em `app/lib/campaign-field.js`, interpolado ponto a ponto (sem MorphSVG, que é plugin pago) |
| Hero cinematográfico dedicado | usa `produtor.webp` até haver produção própria |

Enquanto o turntable roda no fallback, o recurso nunca é chamado de
"360" — nem no texto, nem em analytics.

## Dados comerciais

- Com loja conectada: preço, estoque e variante vêm da Storefront API.
- Sem loja ou com produto não publicado: `lib/manto.js` devolve o produto
  de referência, o botão vira "Loja em ativação" e a página explica o
  porquê. A narrativa nunca cai junto com a API.
- Modelagem e personalização são acréscimos calculados no cliente. Quando
  cada combinação virar variante real, esse cálculo some.

## Anti-referências

Template Shopify, dashboard SaaS, glassmorphism, cards clonados, contador
de urgência falsa, carrossel de produto, HUD de videogame, "compre agora"
piscando, estética de e-commerce de camisa de time genérico.
