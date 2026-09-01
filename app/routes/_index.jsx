import {useLoaderData} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {CampaignMotionProvider} from '~/components/campaign/CampaignMotionProvider';
import {SceneOriginLine} from '~/components/campaign/SceneOriginLine';
import {SceneHero} from '~/components/campaign/SceneHero';
import {SceneFieldMorph} from '~/components/campaign/SceneFieldMorph';
import {SceneBirthCertificate} from '~/components/campaign/SceneBirthCertificate';
import {SceneShieldAssembly} from '~/components/campaign/SceneShieldAssembly';
import {SceneShirtReveal} from '~/components/campaign/SceneShirtReveal';
import {SceneShirtTurntable} from '~/components/campaign/SceneShirtTurntable';
import {SceneDetails} from '~/components/campaign/SceneDetails';
import {SceneStillEarly} from '~/components/campaign/SceneStillEarly';
import {SceneFinalStatement} from '~/components/campaign/SceneFinalStatement';
import {CommercialSupport} from '~/components/campaign/CommercialSupport';
import {StickyBuyBar} from '~/components/campaign/StickyBuyBar';
import {Configurador} from '~/components/Configurador';
import {Faixa, Reveal} from '~/components/Fx';
import {CANON, COMPRA, META} from '~/lib/campaign-copy';
import {PRODUTO_HANDLE, normalizarProduto, produtoFallback} from '~/lib/manto';

/** @type {Route.MetaFunction} */
export const meta = () => [
  {title: META.title},
  {name: 'description', content: META.description},
  {rel: 'canonical', href: '/'},
];

/** @param {Route.LoaderArgs} args */
export async function loader({context}) {
  return {produto: await carregarProduto(context)};
}

/**
 * O comércio nunca pode derrubar a narrativa: se a Storefront API não
 * responder, a página continua inteira com o preço de referência e a compra
 * desabilitada, dizendo o porquê.
 *
 * O que não fazemos: emprestar a variante de outro produto para o fluxo
 * "parecer" funcional. Isso põe no carrinho uma peça que ninguém escolheu e
 * cobra um preço que a página não mostrou.
 *
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
    return produtoFallback('sem-produto');
  } catch (erro) {
    console.error('Storefront indisponível', erro);
    return produtoFallback('offline');
  }
}

/**
 * "Vista o Começo" — três atos, onze capítulos e um epílogo comercial.
 *
 * A rota só compõe e carrega dado. Nenhuma timeline vive aqui: cada cena traz
 * a sua, com escopo próprio, para que voltar pelo histórico do navegador não
 * deixe trigger pendurado.
 */
export default function Home() {
  /** @type {LoaderReturnData} */
  const {produto} = useLoaderData();

  return (
    <CampaignMotionProvider>
      <div className="campanha">
        {/* ------------------------ ATO I · ORIGEM ------------------------ */}
        <SceneOriginLine />
        <SceneHero />
        <SceneFieldMorph />
        <SceneBirthCertificate />

        <Faixa
          itens={[
            CANON.lema,
            'Produtor rural',
            CANON.praca,
            `Fundado em ${CANON.fundacao}`,
            `Temporada ${CANON.temporada}`,
          ]}
        />

        {/* ----------------------- ATO II · SÍMBOLO ----------------------- */}
        <SceneShieldAssembly />
        <SceneShirtReveal />
        <SceneShirtTurntable />
        <SceneDetails />

        {/* ---------------------- ATO III · HISTÓRIA ---------------------- */}
        <SceneStillEarly />
        <SceneFinalStatement produto={produto} />

        {/* --------------------- EPÍLOGO · CONVERSÃO ---------------------- */}
        <section
          className="mn-secao mn-comprar"
          id="comprar"
          aria-labelledby="comprar-titulo"
        >
          <div className="env">
            <Reveal>
              <p className="mn-num">Primeiro capítulo</p>
              <h2 className="d2" id="comprar-titulo">
                {COMPRA.titulo}
              </h2>
              <p
                className="serif-lead"
                style={{maxWidth: '46ch', marginTop: '1.2rem'}}
              >
                {COMPRA.subtitulo}
              </p>
            </Reveal>
            <Reveal delay={100} style={{marginTop: 'clamp(2.5rem, 5vw, 3.5rem)'}}>
              <Configurador produto={produto} />
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

        <CommercialSupport />

        <StickyBuyBar produto={produto} />

        {/* Sem catálogo não há evento de produto para mandar — o Analytics
            reclama de variantId vazio e o dado sairia sujo. */}
        {produto.temCatalogo ? (
          <Analytics.ProductView
            data={{
              products: [
                {
                  id: produto.id,
                  title: produto.title,
                  price: produto.preco?.amount ?? '0',
                  vendor: CANON.fornecedor,
                  variantId: produto.variantes[0]?.id ?? '',
                  variantTitle: produto.variantes[0]?.title ?? CANON.produto,
                  quantity: 1,
                },
              ],
            }}
          />
        ) : null}
      </div>
    </CampaignMotionProvider>
  );
}

/**
 * Todas as variantes, não a primeira.
 *
 * A escolha de modelagem, tamanho e personalização precisa resolver para uma
 * variante real com preço e estoque próprios — com uma variante só na mão, a
 * interface teria de inventar o preço das outras.
 */
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
      description
      availableForSale
      options {
        name
        optionValues { name }
      }
      featuredImage { url altText width height }
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          sku
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

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
