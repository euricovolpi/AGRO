/**
 * MANTO I 2027 — o conteúdo editorial da landing.
 *
 * O comércio (preço, estoque, variante) vem da Storefront API quando a loja
 * está conectada. O que está aqui é a camada que a API não guarda: a voz do
 * clube, os detalhes de confecção lidos no render e a ordem de leitura da
 * página. Separado assim, trocar de loja não apaga a narrativa — e a página
 * continua inteira mesmo com a API fora do ar.
 *
 * Preços abaixo são de referência (mock.shop / pré-lançamento). Ao conectar a
 * loja real, PRODUTO_HANDLE passa a mandar e estes viram apenas fallback.
 */

export const PRODUTO_HANDLE = 'manto-i-2027';

export const CLUBE = {
  nome: 'Agro Esporte Clube',
  praca: 'Catalão, Goiás',
  temporada: '2027',
  fornecedor: 'VOLT',
  lema: 'FÉ · TRABALHO · LEGADO',
  fundacao: '2026',
};

/** Preço de referência enquanto não há loja conectada. */
export const PRECO_BASE = {amount: '349.90', currencyCode: 'BRL'};
export const PRECO_DE = {amount: '429.90', currencyCode: 'BRL'};

/**
 * Modelagens. "Torcedor" é a peça de arquibancada; "Atleta" é o corte de jogo.
 * O acréscimo é somado sobre o preço base.
 */
export const MODELAGENS = [
  {
    id: 'torcedor',
    nome: 'Torcedor',
    resumo: 'Corte reto, caimento solto. A camisa de vestir todo dia.',
    acrescimo: 0,
  },
  {
    id: 'atleta',
    nome: 'Atleta',
    resumo: 'Corte de jogo, colado ao corpo. Mesma malha do gramado.',
    acrescimo: 60,
  },
];

/** Nome e número nas costas: acréscimo único, aplicado uma vez por peça. */
export const PERSONALIZACAO = {valor: 49.9, maxNome: 12};

export const TAMANHOS = [
  {id: 'P', torax: '96–101', comprimento: '70'},
  {id: 'M', torax: '102–107', comprimento: '72'},
  {id: 'G', torax: '108–113', comprimento: '74'},
  {id: 'GG', torax: '114–119', comprimento: '76'},
  {id: 'XGG', torax: '120–125', comprimento: '78'},
];

/**
 * Pontos quentes sobre o render. Coordenadas em % da caixa da imagem — fixas
 * de propósito: o marcador precisa cair no mesmo ponto no servidor e no
 * cliente, senão a hidratação briga.
 */
export const DETALHES = {
  frente: [
    {
      id: 'gola',
      x: 50,
      y: 13,
      titulo: 'Gola em V, taping tricolor',
      texto:
        'Por dentro, impressa onde só quem veste enxerga: FÉ · TRABALHO · LEGADO. Abaixo, PRODUTOR RURAL.',
      imagem: '/manto/detalhe-gola.webp',
      alt: 'Gola em V com faixa dourada e a inscrição interna FÉ TRABALHO LEGADO, PRODUTOR RURAL',
    },
    {
      id: 'escudo',
      x: 65,
      y: 22,
      titulo: 'Escudo bordado, estrela solta',
      texto:
        'Sol nascendo sobre a lavoura, ramos de louro, 2026 na base. A estrela acima marca a fusão que fundou o clube.',
      imagem: '/manto/detalhe-escudo.webp',
      alt: 'Escudo dourado do Agro Esporte Clube bordado no peito da camisa',
    },
    {
      id: 'tecido',
      x: 41,
      y: 54,
      titulo: 'Jacquard de espiga',
      texto:
        'A malha não é lisa: colunas de espiga em relevo correm da barra à costura do ombro. Aparece na luz, some na sombra.',
      imagem: '/manto/detalhe-tecido.webp',
      alt: 'Detalhe da malha com relevo em formato de espiga de trigo',
    },
  ],
  costas: [
    {
      id: 'numero',
      x: 50,
      y: 36,
      titulo: 'Numeração dourada em relevo',
      texto:
        'Tipografia própria do clube, em transfer metálico, com o brasão vazado no pé do número.',
      imagem: '/manto/detalhe-numero.webp',
      alt: 'Número 10 dourado aplicado nas costas da camisa',
    },
    {
      id: 'punho',
      x: 13,
      y: 44,
      titulo: 'Punho canelado',
      texto:
        'Três faixas — creme, verde, dourado. O mesmo desenho fecha a gola e a barra do meião.',
      imagem: '/manto/detalhe-punho.webp',
      alt: 'Punho canelado da manga com faixas creme, verde e dourada',
    },
  ],
};

/** Ficha técnica — o que a etiqueta diria se a etiqueta falasse. */
export const FICHA = [
  {rotulo: 'Coleção', valor: 'Manto I · Temporada 2027'},
  {rotulo: 'Fornecedor', valor: 'VOLT Sport'},
  {rotulo: 'Malha', valor: 'Poliéster reciclado, jacquard de espiga'},
  {rotulo: 'Gramatura', valor: '145 g/m²'},
  {rotulo: 'Tecnologia', valor: 'Secagem rápida e proteção UV 50+'},
  {rotulo: 'Gola', valor: 'V com taping interno serigrafado'},
  {rotulo: 'Aplicações', valor: 'Escudo bordado, numeração em transfer metálico'},
  {rotulo: 'Origem', valor: 'Confeccionado no Brasil'},
];

/** O calendário que a camisa vai vestir. */
export const CALENDARIO = [
  {
    sigla: 'GO',
    nome: 'Campeonato Goiano',
    nota: 'Primeira Divisão · estreia oficial',
  },
  {sigla: 'BR', nome: 'Brasileirão Série D', nota: 'Temporada 2027'},
  {sigla: 'CB', nome: 'Copa do Brasil', nota: 'Participação condicionada'},
];

/** Repercussão real do projeto — a camisa já nasce falada. */
export const IMPRENSA = [
  {
    veiculo: 'ge',
    chamada: 'Agro Esporte Clube: time da elite de Goiás muda nome e escudo',
  },
  {
    veiculo: 'Band',
    chamada: 'O novo time que promete investir R$ 11 milhões na temporada',
  },
  {
    veiculo: 'Mais Goiás',
    chamada: 'Abecat terá novo nome a partir de 2027 e objetivo grandioso',
  },
  {
    veiculo: 'CompreRural',
    chamada: 'Clube brasileiro vira "time do agro", adota verde e dourado',
  },
];

export const FAQ = [
  {
    p: 'Quando a camisa chega?',
    r: 'Os pedidos da primeira leva saem da confecção em até 30 dias, antes da estreia oficial no Goiano. O código de rastreio vai por e-mail assim que o lote é despachado.',
  },
  {
    p: 'Qual a diferença entre Torcedor e Atleta?',
    r: 'A malha e o desenho são os mesmos. Torcedor tem corte reto e caimento solto; Atleta é o corte de jogo, mais ajustado ao corpo e com manga mais curta.',
  },
  {
    p: 'Posso personalizar com nome e número?',
    r: 'Pode. A personalização usa a tipografia oficial do clube em transfer metálico. Peça personalizada não tem troca por arrependimento — só por defeito de fabricação.',
  },
  {
    p: 'E se o tamanho não servir?',
    r: 'A primeira troca por tamanho é por nossa conta, em até 30 dias, com a peça sem uso e com etiqueta. Personalizadas ficam de fora.',
  },
  {
    p: 'É a mesma camisa que os atletas usam?',
    r: 'É o mesmo manto. O corte Atleta é idêntico ao de jogo; muda só a numeração, que em campo segue a inscrição da competição.',
  },
];

/**
 * Produto de fallback: mantém a página inteira — preço, parcelas, botão — de
 * pé quando não há loja conectada ou a Storefront API falha.
 * @param {string} [motivo]
 */
export function produtoFallback(motivo = 'sem-loja') {
  return {
    id: null,
    handle: PRODUTO_HANDLE,
    title: 'Manto I 2027',
    motivo,
    mock: true,
    preco: PRECO_BASE,
    precoDe: PRECO_DE,
    variantId: null,
    variante: null,
    availableForSale: true,
  };
}

/**
 * Normaliza o que veio da Storefront API para o formato que a página lê.
 * @param {any} product
 */
export function normalizarProduto(product) {
  if (!product?.id) return null;
  const variante =
    product.selectedOrFirstAvailableVariant ?? product.variants?.nodes?.[0];
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    motivo: null,
    mock: false,
    preco: variante?.price ?? product.priceRange?.minVariantPrice ?? PRECO_BASE,
    precoDe: variante?.compareAtPrice ?? null,
    variantId: variante?.id ?? null,
    // A variante inteira segue junto: o carrinho otimista do Hydrogen precisa
    // dela para desenhar a linha antes da resposta do servidor.
    variante: variante ?? null,
    availableForSale: product.availableForSale ?? true,
  };
}
