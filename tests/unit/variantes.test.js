import {describe, expect, it} from 'vitest';
import {
  MOTIVO,
  OPCAO,
  PERSONALIZACAO_VALOR,
  acharVariante,
  estadoDeCompra,
  opcoesDoProduto,
  selecaoInicial,
  temOpcaoPersonalizacao,
  valoresPossiveis,
} from '../../app/lib/variantes';

/** Catálogo mínimo com as três opções que mexem em preço e estoque. */
function catalogo() {
  const combinacoes = [
    ['Torcedor', 'M', 'Sem', '349.90', true],
    ['Torcedor', 'G', 'Sem', '349.90', true],
    ['Torcedor', 'G', 'Com', '399.80', true],
    ['Torcedor', 'GG', 'Sem', '349.90', false], // esgotado
    ['Atleta', 'G', 'Sem', '409.90', true],
  ];

  return {
    id: 'gid://shopify/Product/1',
    handle: 'manto-i-2027',
    title: 'Edição Fundadora',
    options: [
      {name: OPCAO.modelagem, optionValues: [{name: 'Torcedor'}, {name: 'Atleta'}]},
      {
        name: OPCAO.tamanho,
        optionValues: [{name: 'M'}, {name: 'G'}, {name: 'GG'}],
      },
      {
        name: OPCAO.personalizacao,
        optionValues: [{name: 'Sem'}, {name: 'Com'}],
      },
    ],
    variantes: combinacoes.map(([mod, tam, pers, valor, disponivel], i) => ({
      id: `gid://shopify/ProductVariant/${i + 1}`,
      availableForSale: disponivel,
      price: {amount: valor, currencyCode: 'BRL'},
      selectedOptions: [
        {name: OPCAO.modelagem, value: mod},
        {name: OPCAO.tamanho, value: tam},
        {name: OPCAO.personalizacao, value: pers},
      ],
    })),
    temCatalogo: true,
    mock: false,
  };
}

describe('opções do produto', () => {
  it('lê nome e valores na ordem do catálogo', () => {
    const opcoes = opcoesDoProduto(catalogo());
    expect(opcoes.map((o) => o.nome)).toEqual([
      OPCAO.modelagem,
      OPCAO.tamanho,
      OPCAO.personalizacao,
    ]);
    expect(opcoes[1].valores).toEqual(['M', 'G', 'GG']);
  });

  it('não inventa opção quando o produto não tem nenhuma', () => {
    expect(opcoesDoProduto({options: []})).toEqual([]);
    expect(opcoesDoProduto(null)).toEqual([]);
  });

  it('reconhece a existência da personalização', () => {
    expect(temOpcaoPersonalizacao(opcoesDoProduto(catalogo()))).toBe(true);
    expect(temOpcaoPersonalizacao([{nome: OPCAO.tamanho, valores: ['G']}])).toBe(
      false,
    );
  });
});

describe('seleção inicial', () => {
  it('respeita a preferência quando ela existe no catálogo', () => {
    const selecao = selecaoInicial(opcoesDoProduto(catalogo()), {
      [OPCAO.tamanho]: 'G',
    });
    expect(selecao[OPCAO.tamanho]).toBe('G');
  });

  it('cai no primeiro valor quando a preferência não existe', () => {
    const selecao = selecaoInicial(opcoesDoProduto(catalogo()), {
      [OPCAO.tamanho]: 'XGG',
    });
    expect(selecao[OPCAO.tamanho]).toBe('M');
  });
});

describe('achar variante', () => {
  const produto = catalogo();

  it('casa a combinação exata', () => {
    const v = acharVariante(produto.variantes, {
      [OPCAO.modelagem]: 'Torcedor',
      [OPCAO.tamanho]: 'G',
      [OPCAO.personalizacao]: 'Sem',
    });
    expect(v?.price.amount).toBe('349.90');
  });

  it('cobra a mais quando a personalização entra', () => {
    const v = acharVariante(produto.variantes, {
      [OPCAO.modelagem]: 'Torcedor',
      [OPCAO.tamanho]: 'G',
      [OPCAO.personalizacao]: PERSONALIZACAO_VALOR.com,
    });
    expect(v?.price.amount).toBe('399.80');
  });

  it('não casa parcialmente — vender um tamanho e despachar outro', () => {
    const v = acharVariante(produto.variantes, {
      [OPCAO.modelagem]: 'Atleta',
      [OPCAO.tamanho]: 'GG',
      [OPCAO.personalizacao]: 'Sem',
    });
    expect(v).toBeNull();
  });
});

describe('valores possíveis', () => {
  it('marca o que o catálogo não tem para a combinação atual', () => {
    const produto = catalogo();
    const possiveis = valoresPossiveis(
      produto.variantes,
      {
        [OPCAO.modelagem]: 'Atleta',
        [OPCAO.tamanho]: 'G',
        [OPCAO.personalizacao]: 'Sem',
      },
      OPCAO.tamanho,
    );
    expect([...possiveis]).toEqual(['G']);
  });
});

describe('estado de compra', () => {
  const produto = catalogo();

  it('libera quando há variante disponível', () => {
    const variante = acharVariante(produto.variantes, {
      [OPCAO.modelagem]: 'Torcedor',
      [OPCAO.tamanho]: 'G',
      [OPCAO.personalizacao]: 'Sem',
    });
    expect(estadoDeCompra({produto, variante})).toEqual({
      podeComprar: true,
      motivo: MOTIVO.ok,
    });
  });

  it('bloqueia quando a variante está esgotada', () => {
    const variante = acharVariante(produto.variantes, {
      [OPCAO.modelagem]: 'Torcedor',
      [OPCAO.tamanho]: 'GG',
      [OPCAO.personalizacao]: 'Sem',
    });
    expect(estadoDeCompra({produto, variante}).motivo).toBe(MOTIVO.esgotado);
  });

  it('bloqueia quando a combinação não existe', () => {
    expect(estadoDeCompra({produto, variante: null}).motivo).toBe(
      MOTIVO.semCombinacao,
    );
  });

  it('bloqueia quando não há catálogo conectado', () => {
    const semLoja = {...produto, temCatalogo: false, mock: true};
    expect(estadoDeCompra({produto: semLoja, variante: null}).motivo).toBe(
      MOTIVO.semLoja,
    );
  });
});
