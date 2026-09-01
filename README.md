# AGRO

Projeto Agro Esporte Clube — Catalão, Goiás. Temporada 2027.

## O que tem aqui

| Pasta | O que é |
| --- | --- |
| `agro-storefront/` | Loja oficial headless (Shopify Hydrogen). Landing de venda do Manto I 2027. |
| `Agro Esporte Clube - Layout Midia Kit.fig.zip` | Mídia kit 2027 em Figma (70 MB, fora do versionamento). |

## agro-storefront

Landing page de venda da camisa oficial, no mesmo stack e nas mesmas
convenções do `SITE CBV 2.0/cbv-storefront`. Ver
[`agro-storefront/PRODUCT.md`](agro-storefront/PRODUCT.md) para o
registro de marca, sistema visual e regras de motion.

```bash
cd agro-storefront && npm install && npm run dev
```

Sobe em `http://localhost:3000` (ou `--port 3200`, que é o que
`.claude/launch.json` usa). Sem loja conectada, roda contra `mock.shop`:
a página monta inteira com o preço de referência de `app/lib/manto.js` e
o fluxo de sacola segue testável.

Para conectar a loja real:

```bash
cd agro-storefront && npx shopify hydrogen link
```

Depois disso, `PRODUTO_HANDLE` (`manto-i-2027`) passa a mandar em preço,
estoque e variantes.

## Assets

Os renders do manto em `agro-storefront/public/manto/` foram extraídos do
`.fig` do mídia kit e reenquadrados para web (WebP). O `.fig.zip` fica
fora do git — ver `.gitignore`.
