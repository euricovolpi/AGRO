import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import resetStyles from '~/styles/reset.css?url';
import agroStyles from '~/styles/agro.css?url';
import campaignMotionStyles from '~/styles/campaign-motion.css?url';
import campaignStyles from '~/styles/campaign.css?url';
import mantoStyles from '~/styles/manto.css?url';
import archivoNarrow from '@fontsource/archivo-narrow/index.css?url';
import archivoNarrow700 from '@fontsource/archivo-narrow/700.css?url';
import gelasio from '@fontsource/gelasio/index.css?url';
import gelasioItalic from '@fontsource/gelasio/400-italic.css?url';
import {PageLayout} from '~/components/PageLayout';
import {Grao} from '~/components/Fx';

/**
 * Roda antes da primeira pintura. Decide o que não pode esperar a hidratação,
 * porque esperar viraria flash na tela:
 *
 * 1. `motion-ready` libera os estados iniciais escondidos do CSS. Sem JS a
 *    classe nunca entra e todo o conteúdo nasce — e permanece — visível.
 * 2. `reduce-motion` desliga esses mesmos estados para quem pediu menos
 *    movimento.
 * 3. `intro-vista` mata o prólogo em visita repetida ou entrada por hash,
 *    antes de ele chegar a aparecer; e, quando o prólogo vai rodar,
 *    `intro-ativa` já esconde o header desde o primeiro quadro, em vez de
 *    deixá-lo desaparecer por transição depois da hidratação.
 *
 * E instala o watchdog do boot. Esconder conteúdo por CSS é uma promessa de
 * que o JavaScript vai devolvê-lo; se o bundle não carregar, a hidratação
 * falhar ou um chunk quebrar, essa promessa fica sem dono e a página fica
 * vazia. Passados 2,5 s sem o provider confirmar, o watchdog remove as
 * classes que escondem, marca `motion-failed` e o documento volta a ser
 * legível. O provider, por sua vez, vê `motion-failed` e não anima — senão
 * reesconderia tudo por estilo inline.
 *
 * Qualquer exceção aqui também termina em fail-open: sem as classes, nada no
 * CSS esconde coisa alguma.
 */
const BOOT_MOTION = `(function(){var d=document.documentElement;try{d.classList.add('motion-ready','motion-booting');if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('reduce-motion');}if(sessionStorage.getItem('agro-intro')==='1'||window.location.hash){d.classList.add('intro-vista');}else if(!d.classList.contains('reduce-motion')){d.classList.add('intro-ativa');}var t=setTimeout(function(){d.classList.remove('motion-ready','motion-booting','intro-ativa');d.classList.add('motion-failed','intro-vista');},2500);window.__agroBootOk=function(){clearTimeout(t);d.classList.remove('motion-booting');};}catch(e){d.classList.remove('motion-ready','motion-booting','intro-ativa');d.classList.add('motion-failed','intro-vista');window.__agroBootErro=String(e&&e.message||e);}})();`;

/**
 * Evita refetch das queries de root em navegação interna.
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return false;
};

export function links() {
  return [
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'preconnect', href: 'https://shop.app'},
    {rel: 'icon', type: 'image/webp', href: '/manto/escudo-icone.webp'},
    // Nenhum `preload` de imagem. A primeira tela é o prólogo — gradiente,
    // uma linha e texto —, então pré-carregar a foto do hero só antecipava
    // 114 KB e fazia o LCP se prender a um elemento abaixo da dobra.
  ];
}

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  const {storefront, customerAccount, cart, env} = context;

  return {
    // Sacola e login são deferidos: nada acima da dobra depende deles.
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  };
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();

  return (
    // O script de boot marca classes no <html> antes da hidratação; sem
    // suppress o React acusa "extra attributes from the server".
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <meta name="theme-color" content="#070b08" />
        <link rel="stylesheet" href={resetStyles} />
        <link rel="stylesheet" href={archivoNarrow} />
        <link rel="stylesheet" href={archivoNarrow700} />
        <link rel="stylesheet" href={gelasio} />
        <link rel="stylesheet" href={gelasioItalic} />
        <link rel="stylesheet" href={agroStyles} />
        <link rel="stylesheet" href={campaignMotionStyles} />
        <link rel="stylesheet" href={campaignStyles} />
        <link rel="stylesheet" href={mantoStyles} />
        <Meta />
        <Links />
        {/* O nonce só existe no HTML servido; sem suppress o React acusa
            divergência de hidratação num script que nem re-executa. */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{__html: BOOT_MOTION}}
        />
      </head>
      <body>
        <Grao />
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  if (!data) return <Outlet />;

  return (
    <Analytics.Provider cart={data.cart} shop={data.shop} consent={data.consent}>
      <PageLayout cart={data.cart}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let mensagem = 'Erro desconhecido';
  let status = 500;

  if (isRouteErrorResponse(error)) {
    mensagem = error?.data?.message ?? error.data;
    status = error.status;
  } else if (error instanceof Error) {
    mensagem = error.message;
  }

  return (
    <div className="env" style={{paddingBlock: '8rem'}}>
      <p className="kicker">Erro {status}</p>
      <h1 className="d2">Fora de campo.</h1>
      <p style={{marginTop: '1rem'}}>{mensagem}</p>
      <a className="btn" href="/" style={{marginTop: '2rem'}}>
        Voltar para a loja
      </a>
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */
/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('./+types/root').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
