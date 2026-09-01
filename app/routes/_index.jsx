import {useLoaderData} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {Reveal, ScrollFx, Faixa} from '~/components/Fx';
import {Visor} from '~/components/Visor';
import {Configurador} from '~/components/Configurador';
import {formatPreco, formatParcela, parcelasIdeais} from '~/lib/money';
import {
  CALENDARIO,
  CLUBE,
  FAQ,
  FICHA,
  IMPRENSA,
  PRODUTO_HANDLE,
  normalizarProduto,
  produtoFallback,
} from '~/lib/manto';

/** @type {Route.MetaFunction} */
export const meta = () => [
  {title: 'Manto I 2027 — Camisa oficial do Agro Esporte Clube'},
  {
    name: 'description',
    content:
      'A primeira camisa oficial do Agro Esporte Clube. Verde de lavoura à noite, dourado de sol nascendo, jacquard de espiga e o lema FÉ · TRABALHO · LEGADO na gola. Temporada 2027, Catalão, Goiás.',
  },
  {rel: 'canonical', href: '/'},
];

/** @param {Route.LoaderArgs} args */
export async function loader({context}) {
  return {produto: await carregarProduto(context)};
}

/**
 * O comércio nunca pode derrubar a narrativa: se a Storefront API não
 * responder, a página continua inteira com o preço de referência e o botão
 * desabilitado. Em desenvolvimento contra mock.shop, emprestamos a variante
 * de um produto qualquer só para o fluxo de sacola continuar testável.
 * @param {any} context
 */
async function carregarProduto(context) {
  const {storefront} = context;

  try {
    const {product} = await storefront.query(PRODUTO_QUERY, {
      variables: {handle: PRODUTO_HANDLE},
    });
    const normalizado = normalizarProduto(product);
    if (normalizado) return normalizado;
  } catch (erro) {
    console.error('Storefront: manto indisponível', erro);
  }

  try {
    const {products} = await storefront.query(PRIMEIRA_VARIANTE_QUERY);
    const variante = products?.nodes?.[0]?.variants?.nodes?.[0];
    if (variante?.id) {
      return {...produtoFallback('mock'), variantId: variante.id, variante};
    }
  } catch (erro) {
    console.error('Storefront: catálogo indisponível', erro);
  }

  return produtoFallback('offline');
}

export default function Home() {
  /** @type {LoaderReturnData} */
  const {produto} = useLoaderData();
  const vezes = parcelasIdeais(produto.preco);

  return (
    <div className="mn">
      <ScrollFx />

      {/* ---------------------------- HERO ---------------------------- */}
      <section className="mn-hero" aria-labelledby="mn-h1">
        <div className="mn-sol" aria-hidden="true" />
        <div className="mn-horizonte" aria-hidden="true" />

        <div className="mn-hero-grade">
          <p className="mn-hero-fundo" aria-hidden="true">
            Manto
          </p>

          <p className="kicker mn-hero-kicker">
            <i />
            Manto I · Temporada {CLUBE.temporada}
            <i />
          </p>

          <h1 className="d1 mn-titulo" id="mn-h1">
            <span>O campo agora</span>
            <span>tem camisa.</span>
          </h1>

          <div className="mn-hero-peca">
            <img
              src="/manto/manto-frente.webp"
              width="1166"
              height="1436"
              alt="Camisa oficial Manto I 2027 do Agro Esporte Clube, verde-escura com gola e punhos dourados"
              fetchpriority="high"
              decoding="async"
            />
          </div>

          <div className="mn-hero-pe">
            <a className="btn" href="#comprar">
              Comprar o manto
            </a>
            <a className="btn fantasma" href="#detalhes">
              Ver de perto
            </a>
          </div>

          <p className="mn-hero-preco">
            A partir de <b>{formatPreco(produto.preco)}</b>
            {vezes > 1 ? (
              <> · em até {vezes}× de {formatParcela(produto.preco, vezes)}</>
            ) : null}
          </p>
        </div>

        <p className="mn-rolar" aria-hidden="true">
          <i />
          Role
        </p>
      </section>

      <Faixa
        itens={[
          CLUBE.lema,
          'Produtor rural',
          'Catalão · Goiás',
          `Temporada ${CLUBE.temporada}`,
          'Manto I',
          `${CLUBE.fornecedor} Sport`,
        ]}
      />

      {/* -------------------------- MANIFESTO -------------------------- */}
      <section className="mn-secao mn-manifesto" id="manifesto">
        <div className="env">
          <Reveal>
            <p>
              O agro sempre teve voz.
              <br />
              Agora tem <em>manto</em>.
            </p>
            <p className="assinatura">
              {CLUBE.nome} · {CLUBE.praca}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mn-regua" />

      {/* --------------------------- DETALHES -------------------------- */}
      <section className="mn-secao" id="detalhes" aria-labelledby="mn-detalhes">
        <div className="env">
          <Reveal>
            <p className="mn-num">01 · O manto por dentro</p>
            <h2 className="d2" id="mn-detalhes">
              Costura
              <br />
              por costura.
            </h2>
            <p className="serif-lead" style={{maxWidth: '48ch', marginTop: '1.4rem'}}>
              Gire a peça, abra os pontos marcados e leia o que o render mostra:
              a lavoura está no tecido, não só no nome.
            </p>
          </Reveal>

          <Reveal delay={120} style={{marginTop: 'clamp(2.5rem, 5vw, 4rem)'}}>
            <Visor />
          </Reveal>
        </div>
      </section>

      {/* ------------------------ FICHA TÉCNICA ------------------------ */}
      <section className="mn-secao" aria-labelledby="mn-ficha">
        <div className="env">
          <Reveal>
            <p className="mn-num">02 · Ficha técnica</p>
          </Reveal>
          <div className="mn-ficha-grade">
            <Reveal className="mn-ficha-macro">
              <img
                src="/manto/detalhe-tecido.webp"
                width="513"
                height="430"
                alt="Macro da malha com jacquard em relevo no formato de espiga"
                loading="lazy"
                decoding="async"
              />
            </Reveal>
            <Reveal delay={100}>
              <h2 className="d3" id="mn-ficha">
                Feita para o gramado.
                <br />
                Desenhada para a lavoura.
              </h2>
              <dl className="mn-ficha-lista" style={{marginTop: '1.8rem'}}>
                {FICHA.map((linha) => (
                  <div key={linha.rotulo}>
                    <dt>{linha.rotulo}</dt>
                    <dd>{linha.valor}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --------------------------- COMPRAR --------------------------- */}
      <section className="mn-secao mn-comprar" id="comprar" aria-labelledby="mn-comprar-t">
        <div className="env">
          <Reveal>
            <p className="mn-num">03 · Monte o seu</p>
            <h2 className="d2" id="mn-comprar-t">
              Seu nome
              <br />
              nas costas.
            </h2>
          </Reveal>
          <Reveal delay={100} style={{marginTop: 'clamp(2.5rem, 5vw, 3.5rem)'}}>
            <Configurador produto={produto} />
          </Reveal>
        </div>
      </section>

      {/* -------------------------- CALENDÁRIO ------------------------- */}
      <section className="mn-secao" id="calendario" aria-labelledby="mn-cal">
        <div className="env">
          <Reveal>
            <p className="mn-num">04 · Onde ela vai jogar</p>
            <h2 className="d2" id="mn-cal">
              Três competições.
              <br />
              Uma temporada.
            </h2>
          </Reveal>
          <Reveal delay={100} style={{marginTop: 'clamp(2rem, 4vw, 3rem)'}}>
            <div className="mn-calendario">
              {CALENDARIO.map((c) => (
                <article key={c.sigla}>
                  <span className="sigla">{c.sigla}</span>
                  <h3>{c.nome}</h3>
                  <p>{c.nota}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------- GALERIA --------------------------- */}
      <section className="mn-secao" aria-labelledby="mn-galeria-t">
        <div className="env">
          <Reveal>
            <p className="mn-num">05 · Na rua e no campo</p>
            <h2 className="d2" id="mn-galeria-t">
              A camisa
              <br />
              já tem dono.
            </h2>
          </Reveal>
          <Reveal delay={100} style={{marginTop: 'clamp(2rem, 4vw, 3rem)'}}>
            <div className="mn-galeria">
              <figure className="mn-g-alta">
                <img
                  src="/manto/produtor.webp"
                  width="1045"
                  height="1400"
                  alt="Produtor rural de costas usando o manto com o número 10, diante da lavoura"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Produtor rural · nº 10</figcaption>
              </figure>
              <figure className="mn-g-larga">
                <img
                  src="/manto/imprensa.webp"
                  width="1400"
                  height="788"
                  alt="Atleta do clube sendo entrevistado por equipes de imprensa no gramado"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Zona mista</figcaption>
              </figure>
              <figure className="mn-g-meia">
                <img
                  src="/manto/campo.webp"
                  width="585"
                  height="438"
                  alt="Treino do elenco no campo do clube"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Treino · Catalão, Goiás</figcaption>
              </figure>
              <figure className="mn-g-menor">
                <img
                  src="/manto/torcida.webp"
                  width="1200"
                  height="1131"
                  alt="Torcedores comemorando na arquibancada com o cachecol do clube"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>Arquibancada</figcaption>
              </figure>
            </div>
          </Reveal>
        </div>
      </section>

      <Faixa
        inverso
        itens={[
          'Jacquard de espiga',
          'Escudo bordado',
          'Numeração metálica',
          'Gola em V',
          'UV 50+',
          'Confeccionado no Brasil',
        ]}
      />

      {/* -------------------------- IMPRENSA --------------------------- */}
      <section className="mn-secao" aria-labelledby="mn-imprensa-t">
        <div className="env mn-duas">
          <Reveal as="header">
            <p className="mn-num">06 · Já virou notícia</p>
            <h2 className="d3" id="mn-imprensa-t">
              A camisa
              <br />
              nasce falada.
            </h2>
            <p style={{marginTop: '1.2rem', maxWidth: '30ch'}}>
              A fusão que criou o clube pautou a imprensa esportiva antes de a
              primeira bola rolar.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mn-imprensa">
              {IMPRENSA.map((n) => (
                <article key={n.veiculo}>
                  <span className="veiculo">{n.veiculo}</span>
                  <p>{n.chamada}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------- FAQ ----------------------------- */}
      <section className="mn-secao" id="faq" aria-labelledby="mn-faq-t">
        <div className="env mn-duas">
          <Reveal as="header">
            <p className="mn-num">07 · Dúvidas</p>
            <h2 className="d3" id="mn-faq-t">
              Antes
              <br />
              de vestir.
            </h2>
          </Reveal>
          <Reveal delay={100} className="mn-faq">
            {FAQ.map((item) => (
              <details key={item.p}>
                <summary>{item.p}</summary>
                <p>{item.r}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- FECHO ---------------------------- */}
      <section className="mn-secao mn-fecho">
        <div className="env">
          <Reveal>
            <p className="kicker">{CLUBE.lema}</p>
            <h2 className="d2" style={{marginTop: '1.2rem'}}>
              Vista a camisa antes do primeiro apito.
            </h2>
            <a className="btn" href="#comprar">
              Comprar o Manto I
            </a>
          </Reveal>
        </div>
      </section>

      <div className="mn-fim" />

      {/* ---------------------- BARRA DE COMPRA ------------------------ */}
      <div className="mn-barra">
        <div className="mn-barra-info">
          <img
            src="/manto/manto-frente.webp"
            width="1166"
            height="1436"
            alt=""
            aria-hidden="true"
          />
          <div>
            <strong>Manto I 2027 · Camisa oficial</strong>
            <span>
              {formatPreco(produto.preco)}
              {vezes > 1 ? ` · ${vezes}× sem juros` : ''}
            </span>
          </div>
        </div>
        <a className="btn" href="#comprar">
          Comprar
        </a>
      </div>

      {/* Sem variante não há evento de produto para mandar — o Analytics
          reclama de variantId vazio e o dado sairia sujo. */}
      {produto.variantId ? (
        <Analytics.ProductView
          data={{
            products: [
              {
                id: produto.id ?? PRODUTO_HANDLE,
                title: produto.title,
                price: produto.preco?.amount ?? '0',
                vendor: CLUBE.fornecedor,
                variantId: produto.variantId,
                variantTitle: 'Manto I 2027',
                quantity: 1,
              },
            ],
          }}
        />
      ) : null}
    </div>
  );
}

const PRODUTO_QUERY = `#graphql
  query MantoProduto(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      availableForSale
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      variants(first: 1) {
        nodes {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
          image { url altText width height }
          product { title handle }
        }
      }
    }
  }
`;

const PRIMEIRA_VARIANTE_QUERY = `#graphql
  query PrimeiraVariante($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 1) {
      nodes {
        id
        variants(first: 1) {
          nodes {
            id
            title
            availableForSale
            price { amount currencyCode }
            selectedOptions { name value }
            image { url altText width height }
            product { title handle }
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
