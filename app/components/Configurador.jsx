import {useMemo, useState} from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {formatPreco, formatParcela, parcelasIdeais} from '~/lib/money';
import {MODELAGENS, TAMANHOS, PERSONALIZACAO} from '~/lib/manto';

/**
 * O bloco de compra: modelagem, tamanho, personalização e preço, com o
 * preview do nome e do número aplicados sobre o render real das costas.
 *
 * O preço é montado aqui em vez de vir pronto porque modelagem e
 * personalização são acréscimos sobre a peça-base — quando a loja real
 * entrar, cada combinação vira uma variante e este cálculo some.
 *
 * @param {{produto: any}}
 */
export function Configurador({produto}) {
  const {open} = useAside();
  const [modelagem, setModelagem] = useState(MODELAGENS[0].id);
  const [tamanho, setTamanho] = useState('G');
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');

  const personalizado = Boolean(nome.trim() || numero.trim());
  const modelo = MODELAGENS.find((m) => m.id === modelagem) ?? MODELAGENS[0];

  const preco = useMemo(() => {
    const base = Number(produto?.preco?.amount ?? 0);
    const total =
      base + modelo.acrescimo + (personalizado ? PERSONALIZACAO.valor : 0);
    return {
      amount: total.toFixed(2),
      currencyCode: produto?.preco?.currencyCode ?? 'BRL',
    };
  }, [produto, modelo, personalizado]);

  const vezes = parcelasIdeais(preco);

  const atributos = [
    {key: 'Modelagem', value: modelo.nome},
    {key: 'Tamanho', value: tamanho},
  ];
  if (nome.trim()) atributos.push({key: 'Nome', value: nome.trim().toUpperCase()});
  if (numero.trim()) atributos.push({key: 'Número', value: numero.trim()});

  return (
    <div className="mn-config">
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
        <span className="mn-preview-nome">
          {nome.trim() ? nome.trim().toUpperCase() : 'SEU NOME'}
        </span>
        <span className="mn-preview-numero">
          {numero.trim() ? numero.trim() : '10'}
        </span>
      </div>

      <div className="mn-painel">
        <div className="mn-preco">
          <strong>{formatPreco(preco)}</strong>
          {produto?.precoDe ? <s>{formatPreco(produto.precoDe)}</s> : null}
          {vezes > 1 ? (
            <span className="parcela">
              ou {vezes}× de {formatParcela(preco, vezes)} sem juros
            </span>
          ) : null}
        </div>

        <div>
          <div className="mn-campo-rotulo">
            <span>Modelagem</span>
            <em>{modelo.resumo}</em>
          </div>
          <div className="mn-opcoes">
            {MODELAGENS.map((m) => (
              <button
                key={m.id}
                type="button"
                className="mn-opcao larga"
                aria-pressed={m.id === modelagem}
                onClick={() => setModelagem(m.id)}
              >
                {m.nome}
                <small>
                  {m.acrescimo
                    ? `+ ${formatPreco({
                        amount: String(m.acrescimo),
                        currencyCode: preco.currencyCode,
                      })}`
                    : 'Peça-base'}
                </small>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mn-campo-rotulo">
            <span>Tamanho</span>
            <em>Tórax {TAMANHOS.find((t) => t.id === tamanho)?.torax} cm</em>
          </div>
          <div className="mn-opcoes">
            {TAMANHOS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="mn-opcao"
                aria-pressed={t.id === tamanho}
                onClick={() => setTamanho(t.id)}
              >
                {t.id}
              </button>
            ))}
          </div>

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
        </div>

        <div>
          <div className="mn-campo-rotulo">
            <span>Personalização</span>
            <em>
              + {formatPreco({
                amount: String(PERSONALIZACAO.valor),
                currencyCode: preco.currencyCode,
              })}{' '}
              · opcional
            </em>
          </div>
          <div className="mn-entradas">
            <input
              type="text"
              value={nome}
              maxLength={PERSONALIZACAO.maxNome}
              placeholder="Nome nas costas"
              aria-label="Nome nas costas"
              onChange={(e) => setNome(e.target.value.replace(/[^\p{L} .'-]/gu, ''))}
            />
            <input
              type="text"
              inputMode="numeric"
              value={numero}
              maxLength={2}
              placeholder="Nº"
              aria-label="Número nas costas"
              onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        <div className="mn-acoes">
          {produto?.variantId ? (
            <AddToCartButton
              lines={[
                {
                  merchandiseId: produto.variantId,
                  quantity: 1,
                  selectedVariant: produto.variante,
                  attributes: atributos,
                },
              ]}
              onClick={() => open('cart')}
              analytics={{products: [{productGid: produto.id, quantity: 1}]}}
            >
              Colocar na sacola
            </AddToCartButton>
          ) : (
            <button type="button" className="btn" disabled>
              Loja em ativação
            </button>
          )}
          <a className="btn fantasma" href="#detalhes">
            Ver o manto de perto
          </a>
        </div>

        <p className="mn-nota">
          {personalizado
            ? 'Peça personalizada: produção sob encomenda, sem troca por arrependimento.'
            : 'Primeira troca de tamanho por nossa conta, em até 30 dias.'}
        </p>
        {produto?.mock ? (
          <p className="mn-nota">
            {produto.motivo === 'mock'
              ? 'Catálogo de demonstração. Ao publicar o produto oficial, preço, estoque e variantes passam a vir da Storefront API.'
              : `Preço de referência: o produto “${produto.handle}” ainda não está publicado na loja. Assim que ele existir no Shopify, a compra abre sozinha.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
