# AGRO

Projeto Agro Esporte Clube — Catalão, Goiás. Temporada 2027.

## O que tem aqui

| Pasta | O que é |
| --- | --- |
| `app/` | Loja oficial headless (Shopify Hydrogen). Campanha Vista o Começo, que vende a Camisa 01. |
| `Agro Esporte Clube - Layout Midia Kit.fig.zip` | Mídia kit 2027 em Figma (70 MB, fora do versionamento). |

## A loja

Landing page de venda da camisa oficial, no mesmo stack e nas mesmas
convenções do `SITE CBV 2.0/cbv-storefront`. Ver
[`PRODUCT.md`](PRODUCT.md) para o
registro de marca, sistema visual e regras de motion.

```bash
npm install && npm run dev
```

Sobe em `http://localhost:3000` (ou `--port 3200`, que é o que
`.claude/launch.json` usa). Sem loja conectada, roda contra `mock.shop`:
a página monta inteira com o preço de referência de `app/lib/manto.js` e
o fluxo de sacola segue testável.

### Antes de qualquer deploy

```bash
npm run build && npx shopify hydrogen preview
```

`npm run build` passar não garante que a loja sobe: o build compila, mas quem
executa o bundle é o runtime de Workers. `hydrogen preview` roda o build de
produção no mesmo workerd que o Oxygen usa e é o único passo local que pega
erro de inicialização do worker. Sem ele, o sintoma aparece só no deploy — que
fica preso em "Verifying deployment has been completed" e **sai com código 0
mesmo tendo falhado**.

Para conectar a loja real:

```bash
npx shopify hydrogen link
```

Depois disso, `PRODUTO_HANDLE` (`manto-i-2027`) passa a mandar em preço,
estoque e variantes.

## Assets

Os renders do manto em `public/manto/` foram extraídos do
`.fig` do mídia kit e reenquadrados para web (WebP). O `.fig.zip` fica
fora do git — ver `.gitignore`.
