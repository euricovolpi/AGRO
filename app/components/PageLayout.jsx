import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Aside} from '~/components/Aside';
import {CartMain} from '~/components/CartMain';
import {CLUBE} from '~/lib/manto';

/**
 * @param {{
 *   cart?: Promise<any>;
 *   children?: React.ReactNode;
 * }}
 */
export function PageLayout({cart, children}) {
  return (
    <Aside.Provider>
      <a className="pula" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SacolaAside cart={cart} />
      <Cabecalho cart={cart} />
      <main id="conteudo">{children}</main>
      <Rodape />
    </Aside.Provider>
  );
}

/** @param {{cart?: Promise<any>}} */
function Cabecalho({cart}) {
  return (
    <header className="cabecalho">
      <Link to="/" className="marca" prefetch="intent">
        <img
          src="/manto/escudo.webp"
          width="667"
          height="900"
          alt=""
          aria-hidden="true"
        />
        <span>
          Agro Esporte Clube
          <br />
          Loja Oficial
        </span>
      </Link>

      <nav aria-label="Seções da página">
        <a href="#manifesto">O manto</a>
        <a href="#detalhes">Detalhes</a>
        <a href="#comprar">Comprar</a>
        <a href="#calendario">Temporada {CLUBE.temporada}</a>
      </nav>

      <BotaoSacola cart={cart} />
    </header>
  );
}

/** @param {{cart?: Promise<any>}} */
function BotaoSacola({cart}) {
  return (
    <Suspense fallback={<Gatilho quantidade={null} />}>
      <Await resolve={cart} errorElement={<Gatilho quantidade={null} />}>
        {(resolvido) => <Gatilho quantidade={resolvido?.totalQuantity ?? 0} />}
      </Await>
    </Suspense>
  );
}

/** @param {{quantidade: number | null}} */
function Gatilho({quantidade}) {
  return (
    <a className="btn fantasma" href="#comprar">
      Sacola
      {quantidade ? <span className="ouro"> ({quantidade})</span> : null}
    </a>
  );
}

/** @param {{cart?: Promise<any>}} */
function SacolaAside({cart}) {
  return (
    <Aside type="cart" heading="Sacola">
      <Suspense fallback={<p>Carregando…</p>}>
        <Await resolve={cart} errorElement={<p>Não foi possível abrir a sacola.</p>}>
          {(resolvido) => <CartMain cart={resolvido} layout="aside" />}
        </Await>
      </Suspense>
    </Aside>
  );
}

function Rodape() {
  return (
    <footer className="rodape">
      <div className="env">
        <div className="rodape-topo">
          <div>
            <img
              className="rodape-escudo"
              src="/manto/escudo.webp"
              width="667"
              height="900"
              alt="Escudo do Agro Esporte Clube"
            />
            <h2 className="d3">
              O campo agora
              <br />
              <span className="ouro">tem camisa.</span>
            </h2>
          </div>
          <div>
            <p style={{maxWidth: '34ch'}}>
              Loja oficial do {CLUBE.nome}. {CLUBE.praca}. Primeira temporada
              oficial em {CLUBE.temporada}.
            </p>
            <div className="rodape-links" style={{marginTop: '1.6rem'}}>
              <a href="#comprar">Comprar o manto</a>
              <a href="#detalhes">Detalhes</a>
              <a href="#faq">Dúvidas</a>
              <span>Fornecedor {CLUBE.fornecedor}</span>
            </div>
          </div>
        </div>

        <div className="rodape-legal">
          <span>
            © {CLUBE.fundacao} {CLUBE.nome}. Todos os direitos reservados.
          </span>
          <span>
            Imagens conceituais de produto. Uniforme sujeito a ajustes de
            confecção e ao enxoval técnico da temporada.
          </span>
        </div>
      </div>
    </footer>
  );
}
