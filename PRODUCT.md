# PRODUCT.md — Loja Agro Esporte Clube

## Register

peça editorial. A camisa é um objeto, não um SKU: fotografada como
artefato em vitrine, escrita como manifesto. O comércio existe e é
direto, mas nunca vira formulário de varejão.

## O que é

Landing page de venda do **Manto I 2027** — a primeira camisa oficial do
Agro Esporte Clube (Catalão, GO). Headless em Shopify Hydrogen, mesmo
stack e mesmas convenções do `cbv-storefront` (Voleishop / CBV).

Uma rota, um produto: `/` é a página do produto. `/products/:handle`
redireciona para o bloco de compra.

## Quem usa

Torcedor e produtor rural, no celular (390×844 é a base de projeto).
Chega por campanha do clube, por Instagram ou por notícia da fusão
ABECAT → Agro Esporte Clube. Precisa decidir tamanho, modelagem e
personalização em poucos toques — mas a marca quer que ele se demore.

## Personalidade

Agro sem clichê rural: nada de fonte western, boi, trator ou
verde-amarelo de propaganda. O agro aqui é lavoura à noite, ouro de sol
nascendo, disciplina de trabalho. O lema vive na etiqueta interna da
gola: **FÉ · TRABALHO · LEGADO / PRODUTOR RURAL**.

## Sistema visual

- Tipografia: **Archivo Narrow** (display condensado, caixa alta, escala
  grande) + **Gelasio** (serifada, métrica compatível com Georgia — a
  dupla do mídia kit original é Arial Narrow + Georgia).
- Cores lidas do render do manto: noite `#070b08`, verde-campo `#16452a`,
  ouro `#c6a15b`, cobre `#d2a87f`, creme `#ebdcc2`, papel `#f4f1e7`.
- Prefixo de classe `mn-` na landing inteira. `agro.css` guarda tokens e
  cromo; `manto.css` guarda a composição. Nada vaza entre os dois.
- Grão fixo sobre a página: o preto puro chapa e a peça flutua sem chão.

## Motion

Herdado do projeto do vôlei, mesmas regras:

- O conteúdo **nasce visível**; o JS é quem adiciona a animação
  (SSR/no-JS seguros). `Reveal` só recua para o estado inicial depois de
  confirmar JS e ausência de `prefers-reduced-motion`.
- Posições determinísticas — os marcadores do visor são % fixos em
  `lib/manto.js`, nunca medidos da imagem (hidratação).
- `transform` e `opacity` primeiro. Um único listener de scroll para a
  página toda.
- Momentos assinados: o sol nascendo atrás do manto no hero, o brilho que
  atravessa "TEM CAMISA." uma vez, o giro 3D frente/costas com varredura
  de luz, e o nome + número aplicados ao vivo sobre o render das costas.

## Dados comerciais

- Com loja conectada: preço, estoque e variante vêm da Storefront API
  (`PRODUTO_HANDLE = 'manto-i-2027'`).
- Sem loja: `lib/manto.js` devolve o produto de referência e a página
  continua inteira. Em dev contra `mock.shop`, a variante de um produto
  qualquer é emprestada só para o fluxo de sacola seguir testável — a
  página avisa isso em texto.
- Modelagem e personalização são acréscimos calculados no cliente. Quando
  a loja real entrar, cada combinação vira variante e esse cálculo some.

## Anti-referências

Template Shopify, dashboard SaaS, glassmorphism, cards clonados, contador
de urgência falsa, "compre agora" piscando, banner de cookie gigante,
estética de e-commerce de camisa de time genérico.
