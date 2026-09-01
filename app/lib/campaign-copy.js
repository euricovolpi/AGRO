/**
 * Copy deck da campanha "Vista o Começo" (§15 da spec).
 *
 * Fonte única. Nenhuma cena escreve texto de campanha no JSX: a ordem
 * dramática é o produto, e ela se perde no minuto em que a mesma frase existe
 * em dois lugares. Copy técnica (ficha, FAQ, medidas) continua em manto.js,
 * porque reflete operação e não narrativa.
 */

export const CANON = {
  clube: 'Agro Esporte Clube',
  sigla: 'AGRO EC',
  cidade: 'Catalão',
  estado: 'Goiás',
  praca: 'Catalão · Goiás',
  fundacao: '2026',
  temporada: '2027',
  produto: 'Manto I 2027',
  campanha: 'Camisa 01 — Edição Fundadora',
  campanhaCurta: 'Camisa 01',
  fornecedor: 'VOLT Sport',
  lema: 'FÉ · TRABALHO · LEGADO',
  handle: 'manto-i-2027',
};

export const CTA = {
  principal: 'Vista o começo',
  comSeta: 'Vista o começo →',
  descoberta: 'Conheça a Camisa 01',
};

/** 00 — Preloader / prólogo. */
export const PROLOGO = {
  linhas: ['Agro Esporte Clube', 'Catalão · Goiás', 'Fundado em 2026'],
};

/** 01 — A linha nasce. */
export const ORIGEM = {
  indice: 'Ato I · Origem',
  frases: [
    ['Todo time tem', 'uma história.'],
    ['Essa começa', 'agora.'],
  ],
};

/** 02 — Hero. */
export const HERO = {
  kicker: 'Catalão · GO / 2026',
  titulo1: ['Nascido', 'da terra.'],
  titulo2: ['Feito', 'para o jogo.'],
  assinatura: 'Agro Esporte Clube',
  cta: 'Conheça a Camisa 01',
};

/** 03 — Do campo para o campo. */
export const CAMPO = {
  indice: 'Ato I · Origem',
  titulo1: 'Do campo',
  titulo2: 'para o campo.',
  legendaEstatica: 'Do campo para o campo',
};

/** 04 — Certidão de nascimento. */
export const CERTIDAO = {
  titulo: ['Não herdamos uma história.', 'Estamos construindo uma.'],
  paragrafo:
    'O Agro Esporte Clube nasce em Catalão, Goiás, como um novo projeto esportivo. Uma instituição criada para representar a força de quem move o Brasil através de uma de suas maiores paixões: o futebol.',
  marcaDagua: '2026',
  ficha: [
    {rotulo: 'Nome', valor: 'Agro Esporte Clube'},
    {rotulo: 'Cidade', valor: 'Catalão'},
    {rotulo: 'Estado', valor: 'Goiás'},
    {rotulo: 'Fundação', valor: '2026'},
    {rotulo: 'Estreia', valor: 'Temporada 2027'},
    {rotulo: 'País', valor: 'Brasil'},
    {rotulo: 'Lema', valor: 'FÉ · TRABALHO · LEGADO'},
  ],
};

/** 05 — O escudo nasce. */
export const ESCUDO = {
  indice: 'Ato II · Símbolo',
  titulo: ['Um novo símbolo', 'para uma nova história.'],
};

/** 06 — Revelação da Camisa 01. */
export const REVEAL = {
  frase1: 'O primeiro uniforme.',
  frase2: 'A primeira camisa.',
  marca: 'Camisa 01',
  selo: 'Edição Fundadora',
  tecnico: 'Manto I · Temporada 2027',
};

/** 07 — Turntable e callouts. */
export const CALLOUTS = [
  {id: '01', indice: '01', titulo: 'Escudo AGRO', lado: 'direita'},
  {id: '02', indice: '02', titulo: 'Acabamento dourado', lado: 'esquerda'},
  {id: '03', indice: '03', titulo: 'Identidade 2026', lado: 'direita'},
  {id: '04', indice: '04', titulo: 'Primeiro manto da história', lado: 'esquerda'},
];

/** 08 — Microdetalhes. */
export const DETALHES_CAMPANHA = [
  {
    indice: '01',
    rotulo: 'Brasão',
    frase: 'Um novo símbolo, bordado para durar.',
    imagem: '/manto/detalhe-escudo.webp',
    alt: 'Escudo dourado do Agro Esporte Clube bordado no peito da camisa',
    largura: 548,
    altura: 330,
  },
  {
    indice: '02',
    rotulo: 'Gola',
    frase: 'FÉ · TRABALHO · LEGADO.',
    imagem: '/manto/detalhe-gola.webp',
    alt: 'Gola em V com taping dourado e a inscrição interna FÉ TRABALHO LEGADO, PRODUTOR RURAL',
    largura: 606,
    altura: 287,
  },
  {
    indice: '03',
    rotulo: 'Construção',
    frase: 'A lavoura está no tecido, não só no nome.',
    imagem: '/manto/detalhe-tecido.webp',
    alt: 'Macro da malha com jacquard em relevo no formato de espiga',
    largura: 676,
    altura: 373,
  },
  {
    indice: '04',
    rotulo: 'Numeração',
    frase: 'Dourado em relevo. Identidade do clube.',
    imagem: '/manto/detalhe-numero.webp',
    alt: 'Número dourado aplicado em relevo nas costas da camisa',
    largura: 1100,
    altura: 752,
  },
  {
    indice: '05',
    rotulo: 'Punho',
    frase: 'Creme, verde e dourado fecham a peça.',
    imagem: '/manto/detalhe-punho.webp',
    alt: 'Punho canelado da manga com faixas creme, verde e dourada',
    largura: 675,
    altura: 511,
  },
];

/** 09 — Você chegou no começo / AINDA. */
export const AINDA = {
  abertura: 'Você chegou no começo.',
  negacoes: [
    ['Ainda não existem', 'décadas de títulos.'],
    ['Ainda não existem gerações', 'contando as mesmas histórias.'],
    ['Ainda não existem', 'camisas históricas.'],
  ],
  palavra: 'Ainda.',
  fechamento: ['Toda tradição começa em algum lugar.', 'A nossa começa aqui.'],
};

/** 10 — Frase final de venda. */
export const FINAL = {
  titulo: ['Um dia ela será história.', 'Hoje ela é o começo.'],
  destaque: 'começo',
  produto: 'Camisa 01 — Edição Fundadora',
  tecnico: 'Manto I · Temporada 2027',
};

/** 11 — Configurador. */
export const COMPRA = {
  titulo: 'Faça parte do primeiro capítulo.',
  subtitulo:
    'Escolha modelagem, tamanho e, se quiser, leve seu nome para as costas da primeira camisa da história do clube.',
  cta: 'Vista o começo',
};

/** 12 — Apoio comercial. */
export const APOIO = {
  ficha: 'O que você está vestindo.',
  calendario: 'Onde ela vai jogar.',
  imprensa: 'O clube já nasce falado.',
  faq: 'Antes de vestir.',
};

/** 13 — Footer. */
export const RODAPE = {
  lockup: [
    'Agro Esporte Clube',
    'Catalão · Goiás',
    'Fundado em 2026',
    'Temporada 2027',
    'FÉ · TRABALHO · LEGADO',
  ],
};

export const META = {
  title: 'Camisa 01 — Manto I 2027 | Agro Esporte Clube',
  description:
    'Vista o começo. Conheça a primeira camisa oficial do Agro Esporte Clube, fundado em Catalão, Goiás. Manto I da temporada 2027.',
};
