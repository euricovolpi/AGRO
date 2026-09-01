import {useEffect, useMemo, useRef, useState} from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {formatPreco, formatParcela, parcelasIdeais} from '~/lib/money';
import {PERSONALIZACAO, RESUMO_MODELAGEM, TAMANHOS} from '~/lib/manto';
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
} from '~/lib/variantes';
import {CANON, COMPRA, CTA} from '~/lib/campaign-copy';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

/** Só letras, espaço e alguns sinais — o transfer não grava mais que isso. */
const LIMPAR_NOME = /[^\p{L} .'-]/gu;

/**
 * O bloco de compra da Edição Fundadora.
 *
 * Cada escolha que muda preço ou estoque é uma opção real do catálogo, e o
 * preço exibido é o da variante selecionada — nunca uma soma feita aqui. Se a
 * combinação não existir ou estiver esgotada, a compra fecha e diz por quê.
 *
 * Nome e número são conteúdo digitado: viajam como atributos da linha, não
 * multiplicam variante, e nunca entram em analytics.
 *
 * @param {{produto: any}}
 */
export function Configurador({produto}) {
  const {open} = useAside();
  const {publicarUmaVez} = useCampaignAnalytics();

  const opcoes = useMemo(() => opcoesDoProduto(produto), [produto]);
  const temPersonalizacao = temOpcaoPersonalizacao(opcoes);

  const [selecao, setSelecao] = useState(() =>
    selecaoInicial(opcoes, {[OPCAO.tamanho]: 'G'}),
  );
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const comecou = useRef(false);

  // O catálogo pode chegar depois (navegação, revalidação). Quando as opções
  // mudam, a seleção volta a um estado válido em vez de apontar para valores
  // que não existem mais.
  useEffect(() => {
    setSelecao((atual) => selecaoInicial(opcoes, {[OPCAO.tamanho]: 'G', ...atual}));
  }, [opcoes]);

  const personalizado = Boolean(nome.trim() || numero.trim());

  // A opção de personalização acompanha os campos: preencher liga, apagar os
  // dois desliga e devolve a variante sem o serviço.
  useEffect(() => {
    if (!temPersonalizacao) return;
    const desejado = personalizado
      ? PERSONALIZACAO_VALOR.com
      : PERSONALIZACAO_VALOR.sem;
    setSelecao((atual) =>
      atual[OPCAO.personalizacao] === desejado
        ? atual
        : {...atual, [OPCAO.personalizacao]: desejado},
    );
  }, [personalizado, temPersonalizacao]);

  const variante = useMemo(
    () => acharVariante(produto?.variantes, selecao),
    [produto, selecao],
  );

  const {podeComprar, motivo} = estadoDeCompra({produto, variante});

  // Preço da variante quando existe; caso contrário o de referência, sempre
  // rotulado como tal.
  const preco = variante?.price ?? produto?.preco ?? null;
  const precoDe = variante?.compareAtPrice ?? null;
  const vezes = parcelasIdeais(preco);

  function marcarInicio() {
    if (comecou.current) return;
    comecou.current = true;
    publicarUmaVez('campaign_configurator_start', 'campaign_configurator_start');
  }

  function escolher(nomeOpcao, valor) {
    marcarInicio();
    setSelecao((atual) => ({...atual, [nomeOpcao]: valor}));
    if (nomeOpcao === OPCAO.tamanho) {
      publicarUmaVez('campaign_size_select', `campaign_size_select:${valor}`, {
        size: valor,
      });
    }
  }

  function aoDigitarNome(valor) {
    marcarInicio();
    const limpo = valor.replace(LIMPAR_NOME, '').slice(0, PERSONALIZACAO.maxNome);
    if (limpo.trim()) {
      publicarUmaVez(
        'campaign_personalization_enable',
        'campaign_personalization_enable',
      );
    }
    setNome(limpo);
  }

  function aoDigitarNumero(valor) {
    marcarInicio();
    const limpo = valor.replace(/\D/g, '').slice(0, PERSONALIZACAO.maxNumero);
    // O número sozinho também é personalização — este evento não pode depender
    // de alguém ter digitado o nome.
    if (limpo) {
      publicarUmaVez(
        'campaign_personalization_enable',
        'campaign_personalization_enable',
      );
    }
    setNumero(limpo);
  }

  const atributos = [];
  if (nome.trim()) atributos.push({key: 'Nome', value: nome.trim().toUpperCase()});
  if (numero.trim()) atributos.push({key: 'Número', value: numero.trim()});

  const rotuloBloqueio = {
    [MOTIVO.semLoja]: COMPRA.semLoja,
    [MOTIVO.semCombinacao]: COMPRA.indisponivel,
    [MOTIVO.esgotado]: COMPRA.esgotado,
  }[motivo];

  return (
    <div className="mn-config">
      <PreviaCostas nome={nome} numero={numero} personalizado={personalizado} />

      <div className="mn-painel">
        <header className="mn-nome-produto">
          <h3 className="d4">{produto?.title ?? CANON.produto}</h3>
          <p>
            {CANON.indice} · {CANON.tecnico}
          </p>
        </header>

        <div className="mn-preco">
          <strong>{formatPreco(preco)}</strong>
          {precoDe ? <s>{formatPreco(precoDe)}</s> : null}
          {vezes > 1 ? (
            <span className="parcela">
              ou {vezes}× de {formatParcela(preco, vezes)} sem juros
            </span>
          ) : null}
        </div>

        {opcoes.map((opcao) => (
          <SeletorOpcao
            key={opcao.nome}
            opcao={opcao}
            selecao={selecao}
            variantes={produto?.variantes}
            onEscolher={escolher}
          />
        ))}

        {opcoes.length ? <TabelaMedidas /> : null}

        {temPersonalizacao ? (
          <fieldset className="mn-personalizacao">
            <legend className="mn-campo-rotulo">
              <span>Personalização</span>
              <em>opcional · nome e número nas costas</em>
            </legend>
            <div className="mn-entradas">
              <label className="vis-oculto" htmlFor="cfg-nome">
                Nome nas costas
              </label>
              <input
                id="cfg-nome"
                type="text"
                value={nome}
                maxLength={PERSONALIZACAO.maxNome}
                placeholder="Nome nas costas"
                onChange={(e) => aoDigitarNome(e.target.value)}
              />
              <label className="vis-oculto" htmlFor="cfg-numero">
                Número nas costas
              </label>
              <input
                id="cfg-numero"
                type="text"
                inputMode="numeric"
                value={numero}
                maxLength={PERSONALIZACAO.maxNumero}
                placeholder="Nº"
                onChange={(e) => aoDigitarNumero(e.target.value)}
              />
            </div>
            {personalizado ? (
              <p className="mn-nota">
                Peça personalizada: produção sob encomenda, sem troca por
                arrependimento. Defeito de fabricação continua coberto.
              </p>
            ) : null}
          </fieldset>
        ) : null}

        <div className="mn-acoes">
          {podeComprar ? (
            <AddToCartButton
              lines={[
                {
                  merchandiseId: variante.id,
                  quantity: 1,
                  selectedVariant: variante,
                  attributes: atributos,
                },
              ]}
              onClick={() => {
                publicarUmaVez(
                  'campaign_cta_click',
                  'campaign_cta_click:configurador',
                  {placement: 'configurador'},
                );
                open('cart');
              }}
              analytics={{products: [{productGid: produto.id, quantity: 1}]}}
            >
              {CTA.principal}
            </AddToCartButton>
          ) : (
            <button type="button" className="btn" disabled>
              {rotuloBloqueio}
            </button>
          )}
          <a className="btn fantasma" href="#detalhes">
            Ver o manto de perto
          </a>
        </div>

        {/* Uma região viva só, com a frase inteira: preço e disponibilidade
            mudam juntos, e anunciar cada um separado vira ruído. */}
        <p className="vis-oculto" role="status" aria-live="polite">
          {resumoAcessivel({selecao, preco, podeComprar, rotuloBloqueio})}
        </p>

        {motivo === MOTIVO.semLoja ? (
          <p className="mn-nota">
            Preço de referência: o produto “{produto?.handle}” ainda não está
            publicado na loja. Assim que ele existir no Shopify com as variantes
            de modelagem, tamanho e personalização, a compra abre sozinha.
          </p>
        ) : null}
        {motivo === MOTIVO.semCombinacao ? (
          <p className="mn-nota">
            Essa combinação não existe no catálogo. Escolha outra modelagem ou
            tamanho.
          </p>
        ) : null}
        {motivo === MOTIVO.ok ? (
          <p className="mn-nota">
            Primeira troca de tamanho por nossa conta, em até 30 dias.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** @param {{selecao: object, preco: any, podeComprar: boolean, rotuloBloqueio?: string}} */
function resumoAcessivel({selecao, preco, podeComprar, rotuloBloqueio}) {
  const escolhas = Object.entries(selecao)
    .map(([n, v]) => `${n}: ${v}`)
    .join(', ');
  const valor = preco ? formatPreco(preco) : 'preço indisponível';
  return podeComprar
    ? `${escolhas}. ${valor}. Disponível.`
    : `${escolhas}. ${valor}. ${rotuloBloqueio}.`;
}

/**
 * Um grupo de escolha por opção do catálogo. Valores que não levam a nenhuma
 * variante ficam desabilitados em vez de sumir: some a opção, some a
 * informação de que ela existe.
 *
 * @param {{opcao: {nome: string, valores: string[]}, selecao: object, variantes: any[], onEscolher: Function}}
 */
function SeletorOpcao({opcao, selecao, variantes, onEscolher}) {
  const possiveis = valoresPossiveis(variantes, selecao, opcao.nome);
  const escolhido = selecao[opcao.nome];
  const largo = opcao.nome === OPCAO.modelagem;

  // A personalização é dirigida pelos campos de texto, não por botão solto.
  if (opcao.nome === OPCAO.personalizacao) return null;

  return (
    <fieldset className="mn-grupo-opcao">
      <legend className="mn-campo-rotulo">
        <span>{opcao.nome}</span>
        {largo && RESUMO_MODELAGEM[escolhido] ? (
          <em>{RESUMO_MODELAGEM[escolhido]}</em>
        ) : null}
        {opcao.nome === OPCAO.tamanho ? (
          <em>Tórax {TAMANHOS.find((t) => t.id === escolhido)?.torax} cm</em>
        ) : null}
      </legend>
      <div className="mn-opcoes">
        {opcao.valores.map((valor) => {
          const existe = possiveis.has(valor);
          return (
            <button
              key={valor}
              type="button"
              className={`mn-opcao${largo ? ' larga' : ''}`}
              aria-pressed={valor === escolhido}
              disabled={!existe}
              title={existe ? undefined : 'Indisponível nesta combinação'}
              onClick={() => onEscolher(opcao.nome, valor)}
            >
              {valor}
              {largo && RESUMO_MODELAGEM[valor] ? (
                <small>{RESUMO_MODELAGEM[valor]}</small>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function TabelaMedidas() {
  return (
    <details className="mn-medidas">
      <summary>Tabela de medidas</summary>
      <table>
        <thead>
          <tr>
            <th scope="col">Tamanho</th>
            <th scope="col">Tórax (cm)</th>
            <th scope="col">Comprimento (cm)</th>
          </tr>
        </thead>
        <tbody>
          {TAMANHOS.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.torax}</td>
              <td>{t.comprimento}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

/** @param {{nome: string, numero: string, personalizado: boolean}} */
function PreviaCostas({nome, numero, personalizado}) {
  return (
    <div
      className="mn-preview"
      data-vazio={personalizado ? 'false' : 'true'}
      aria-hidden="true"
    >
      <span className="mn-preview-selo">Prévia · costas</span>
      {/* Costas sem numeração: o render com o 10 impresso brigaria com o
          número que o cliente escolhe. */}
      <img
        src="/manto/manto-costas-limpa.webp"
        width="1224"
        height="1500"
        alt=""
        loading="lazy"
        decoding="async"
      />
      {/* `key` força a remontagem a cada troca: o nome reabre o tracking e o
          número faz um crossfade curto, sem flip de cassino. */}
      <span className="mn-preview-nome" key={`n-${nome}`}>
        {nome.trim() ? nome.trim().toUpperCase() : 'SEU NOME'}
      </span>
      <span className="mn-preview-numero" key={`x-${numero}`}>
        {numero.trim() ? numero.trim() : '10'}
      </span>
    </div>
  );
}
