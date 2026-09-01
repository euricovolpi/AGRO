import {Suspense, useEffect, useState} from 'react';
import {Await, Link} from 'react-router';
import {useAside} from '~/components/Aside';
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
  const [colado, setColado] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const aoRolar = () => setColado(scrollY > 24);
    addEventListener('scroll', aoRolar, {passive: true});
    aoRolar();
    return () => removeEventListener('scroll', aoRolar);
  }, []);

  // Trava a rolagem enquanto o menu cobre a tela, senão o fundo desliza atrás
  // do overlay no iOS.
  useEffect(() => {
    if (!menuAberto) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const aoTeclar = (e) => e.key === 'Escape' && setMenuAberto(false);
    addEventListener('keydown', aoTeclar);
    return () => {
      document.body.style.overflow = anterior;
      removeEventListener('keydown', aoTeclar);
    };
  }, [menuAberto]);

  return (
    <>
      <header className={`cabecalho${colado ? ' colado' : ''}`}>
        <Link to="/" className="marca" prefetch="intent">
          <img
            src="/manto/escudo.webp"
            width="667"
            height="900"
            alt=""
            aria-hidden="true"
          />
          <span>{CANON.sigla}</span>
        </Link>

        <p className="cabecalho-centro" aria-hidden="true">
          {CANON.campanhaCurta}
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
            onClick={() => setMenuAberto((v) => !v)}
          >
            {menuAberto ? 'Fechar' : 'Menu'}
          </button>
        </div>
      </header>

      <div
        id="menu-campanha"
        className={`menu-overlay${menuAberto ? ' aberto' : ''}`}
        hidden={!menuAberto}
      >
        <nav aria-label="Navegação principal">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuAberto(false)}>
              {l.rotulo}
            </a>
          ))}
        </nav>
        <p className="menu-lockup">
          {CANON.clube}
          <br />
          {CANON.praca}
          <br />
          Fundado em {CANON.fundacao}
        </p>
      </div>
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
