import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {MenuCampanha} from '~/components/campaign/MenuCampanha';
import {CANON, CTA} from '~/lib/campaign-copy';

const LINKS = [
  {href: '#origem', rotulo: 'A história'},
  {href: '#camisa', rotulo: 'A camisa'},
  {href: '#detalhes', rotulo: 'Detalhes'},
  {href: '#comprar', rotulo: 'Comprar'},
];

/**
 * Header da campanha (§8 da spec).
 *
 * Cinco estados, todos dirigidos por dado no <html>: `intro-ativa` esconde o
 * header sobre o prólogo, `data-tema` inverte o tema sobre a seção clara, e a
 * classe `colado` entra depois de 24 px de rolagem. Nada disso é medido aqui —
 * quem manda são as cenas, e assim o header não precisa saber onde elas estão.
 *
 * @param {{cart?: Promise<any>}}
 */
export function CampaignHeader({cart}) {
  const {assinarScroll} = useCampaignMotion();
  const [menuAberto, setMenuAberto] = useState(false);
  const headerRef = useRef(null);
  const gatilhoMenuRef = useRef(null);

  // A classe entra direto no DOM, sem estado React: o header muda de fundo uma
  // vez em toda a página, e re-renderizar a árvore a cada evento de rolagem
  // para decidir isso é custo puro.
  useEffect(
    () =>
      assinarScroll((y) => {
        headerRef.current?.classList.toggle('colado', y > 24);
      }),
    [assinarScroll],
  );

  return (
    <>
      <header className="cabecalho" ref={headerRef}>
        <Link to="/" className="marca" prefetch="intent">
          <img
            src="/manto/escudo-icone.webp"
            width="89"
            height="120"
            alt=""
            aria-hidden="true"
          />
          <span>{CANON.sigla}</span>
        </Link>

        <p className="cabecalho-centro" aria-hidden="true">
          {CANON.produto}
        </p>

        <nav className="cabecalho-nav" aria-label="Seções da campanha">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.rotulo}
            </a>
          ))}
        </nav>

        <div className="cabecalho-acoes">
          <a className="cabecalho-cta" href="#comprar">
            {CTA.principal} <span aria-hidden="true">↗</span>
          </a>
          <BotaoSacola cart={cart} />
          <button
            type="button"
            className="cabecalho-menu"
            aria-expanded={menuAberto}
            aria-controls="menu-campanha"
            ref={gatilhoMenuRef}
            onClick={() => setMenuAberto(true)}
          >
            Menu
          </button>
        </div>
      </header>

      <MenuCampanha
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        links={LINKS}
        gatilhoRef={gatilhoMenuRef}
      />
    </>
  );
}

/** @param {{cart?: Promise<any>}} */
function BotaoSacola({cart}) {
  return (
    <Suspense fallback={<Gatilho quantidade={0} />}>
      <Await resolve={cart} errorElement={<Gatilho quantidade={0} />}>
        {(resolvido) => <Gatilho quantidade={resolvido?.totalQuantity ?? 0} />}
      </Await>
    </Suspense>
  );
}

/** @param {{quantidade: number}} */
function Gatilho({quantidade}) {
  const {open} = useAside();
  return (
    <button
      type="button"
      className="cabecalho-sacola"
      onClick={() => open('cart')}
    >
      Sacola
      {quantidade ? <span className="ouro"> ({quantidade})</span> : null}
    </button>
  );
}
