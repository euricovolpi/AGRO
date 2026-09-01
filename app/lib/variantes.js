/**
 * Seleção de variante — funções puras, sem React e sem Shopify.
 *
 * O que a pessoa escolhe e o que ela paga precisam ser a mesma coisa. Somar
 * acréscimos no cliente produz um número que o checkout não honra, então aqui
 * a regra é única: cada combinação que muda preço ou estoque é uma variante
 * real, e o preço exibido é sempre o preço da variante selecionada.
 *
 * Nome e número ficam de fora de propósito: são conteúdo digitado, viajam como
 * atributos da linha e não multiplicam o estoque.
 */

/** Nomes de opção esperados no catálogo. */
export const OPCAO = {
  modelagem: 'Modelagem',
  tamanho: 'Tamanho',
  personalizacao: 'Personalização',
};

/** Valores da opção de personalização. */
export const PERSONALIZACAO_VALOR = {sem: 'Sem', com: 'Com'};

/**
 * Motivos pelos quais a compra pode estar bloqueada.
 * `ok` é o único que libera o botão.
 */
export const MOTIVO = {
  ok: 'ok',
  semLoja: 'sem-loja',
  semCombinacao: 'sem-combinacao',
  esgotado: 'esgotado',
};

/**
 * Opções do produto normalizadas: `[{nome, valores}]`, na ordem do catálogo.
 *
 * Lê o que a loja realmente tem em vez de impor nomes fixos — se o catálogo
 * chamar a opção de "Corte" em vez de "Modelagem", a interface acompanha.
 * @param {any} product
 */
export function opcoesDoProduto(product) {
  const brutas = product?.options ?? [];
  return brutas
    .map((o) => ({
      nome: o?.name ?? '',
      valores: (o?.optionValues ?? o?.values ?? [])
        .map((v) => (typeof v === 'string' ? v : v?.name))
        .filter(Boolean),
    }))
    .filter((o) => o.nome && o.valores.length);
}

/**
 * Seleção inicial: primeiro valor de cada opção, salvo preferência explícita.
 * @param {{nome: string, valores: string[]}[]} opcoes
 * @param {Record<string, string>} [preferido]
 */
export function selecaoInicial(opcoes, preferido = {}) {
  const selecao = {};
  opcoes.forEach((o) => {
    const desejado = preferido[o.nome];
    selecao[o.nome] = o.valores.includes(desejado) ? desejado : o.valores[0];
  });
  return selecao;
}

/**
 * Acha a variante cujas opções casam exatamente com a seleção.
 *
 * Exatamente: toda opção da variante precisa estar na seleção com o mesmo
 * valor. Casar "quase" é como se vende um tamanho e se despacha outro.
 *
 * @param {any[]} variantes
 * @param {Record<string, string>} selecao
 * @returns {any | null}
 */
export function acharVariante(variantes, selecao) {
  if (!Array.isArray(variantes) || !variantes.length) return null;
  const alvo = Object.entries(selecao ?? {});
  if (!alvo.length) return variantes[0] ?? null;

  return (
    variantes.find((v) => {
      const opts = v?.selectedOptions ?? [];
      if (opts.length !== alvo.length) return false;
      return opts.every(({name, value}) => selecao[name] === value);
    }) ?? null
  );
}

/**
 * Valores de uma opção que ainda levam a alguma variante existente, dadas as
 * outras escolhas. Serve para marcar como indisponível o que o catálogo não
 * tem, em vez de deixar a pessoa montar uma combinação impossível.
 *
 * @param {any[]} variantes
 * @param {Record<string, string>} selecao
 * @param {string} nomeOpcao
 */
export function valoresPossiveis(variantes, selecao, nomeOpcao) {
  const outras = Object.entries(selecao ?? {}).filter(([n]) => n !== nomeOpcao);
  const possiveis = new Set();

  (variantes ?? []).forEach((v) => {
    const opts = v?.selectedOptions ?? [];
    const casaOResto = outras.every(([n, valor]) =>
      opts.some((o) => o.name === n && o.value === valor),
    );
    if (!casaOResto) return;
    const esta = opts.find((o) => o.name === nomeOpcao);
    if (esta) possiveis.add(esta.value);
  });

  return possiveis;
}

/**
 * Estado de compra derivado da variante selecionada.
 *
 * @param {{produto: any, variante: any}} entrada
 * @returns {{podeComprar: boolean, motivo: string}}
 */
export function estadoDeCompra({produto, variante}) {
  if (!produto || produto.mock || !produto.temCatalogo) {
    return {podeComprar: false, motivo: MOTIVO.semLoja};
  }
  if (!variante?.id) return {podeComprar: false, motivo: MOTIVO.semCombinacao};
  if (variante.availableForSale === false) {
    return {podeComprar: false, motivo: MOTIVO.esgotado};
  }
  return {podeComprar: true, motivo: MOTIVO.ok};
}

/**
 * A opção de personalização existe no catálogo?
 * @param {{nome: string}[]} opcoes
 */
export function temOpcaoPersonalizacao(opcoes) {
  return (opcoes ?? []).some((o) => o.nome === OPCAO.personalizacao);
}
