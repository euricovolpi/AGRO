/**
 * Formatação de preço para loja brasileira.
 *
 * O <Money> do Hydrogen formata pelo locale do contexto e, em SSR, isso nem
 * sempre chega como pt-BR — o resultado vira "R$299.99" em vez de
 * "R$ 299,99". Numa loja brasileira isso lê como erro. Aqui a formatação é
 * determinística: mesmo resultado no servidor e no cliente.
 */

const FORMATADORES = new Map();

/**
 * @param {string} currency
 * @returns {Intl.NumberFormat}
 */
function formatador(currency) {
  let f = FORMATADORES.get(currency);
  if (!f) {
    f = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    FORMATADORES.set(currency, f);
  }
  return f;
}

/**
 * @param {{amount?: string | number, currencyCode?: string} | null | undefined} money
 * @returns {string}
 */
export function formatPreco(money) {
  if (!money?.amount && money?.amount !== 0) return '';
  const valor = Number(money.amount);
  if (Number.isNaN(valor)) return '';
  return formatador(money.currencyCode || 'BRL').format(valor);
}

/**
 * Divide um preço em parcelas sem juros.
 * @param {{amount?: string | number, currencyCode?: string} | null | undefined} money
 * @param {number} vezes
 */
export function formatParcela(money, vezes) {
  if (!money?.amount || !vezes) return '';
  return formatPreco({...money, amount: Number(money.amount) / vezes});
}

/**
 * Escolhe o número de parcelas mantendo a parcela acima de um piso —
 * é a regra que a loja já pratica hoje (2x a 4x sem juros).
 * @param {{amount?: string | number} | null | undefined} money
 * @param {number} [piso] valor mínimo da parcela
 * @returns {number}
 */
export function parcelasIdeais(money, piso = 70) {
  const valor = Number(money?.amount ?? 0);
  if (!valor) return 1;
  for (let n = 4; n >= 2; n--) {
    if (valor / n >= piso) return n;
  }
  return 1;
}

/**
 * Preço formatado em pt-BR.
 * @param {{
 *   data?: {amount?: string | number, currencyCode?: string} | null;
 *   as?: any;
 *   [key: string]: any;
 * }}
 */
export function Preco({data, as: Tag = 'span', ...rest}) {
  const texto = formatPreco(data);
  if (!texto) return null;
  return <Tag {...rest}>{texto}</Tag>;
}
