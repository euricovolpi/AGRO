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
import mantoStyles from '~/styles/manto.css?url';
import archivoNarrow from '@fontsource/archivo-narrow/index.css?url';
import archivoNarrow700 from '@fontsource/archivo-narrow/700.css?url';
import gelasio from '@fontsource/gelasio/index.css?url';
import gelasioItalic from '@fontsource/gelasio/400-italic.css?url';
import {PageLayout} from '~/components/PageLayout';
import {Grao} from '~/components/Fx';

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
    {rel: 'icon', type: 'image/webp', href: '/manto/escudo.webp'},
    // O manto do hero é o LCP: pré-carregar tira ~300ms da primeira pintura.
    {rel: 'preload', as: 'image', href: '/manto/manto-frente.webp'},
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
    <html lang="pt-BR">
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
        <link rel="stylesheet" href={mantoStyles} />
        <Meta />
        <Links />
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
