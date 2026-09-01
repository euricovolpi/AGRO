import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Aside} from '~/components/Aside';
import {CartMain} from '~/components/CartMain';
import {CampaignHeader} from '~/components/campaign/CampaignHeader';
import {CANON, RODAPE} from '~/lib/campaign-copy';

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
      <CampaignHeader cart={cart} />
      <main id="conteudo">{children}</main>
      <Rodape />
    </Aside.Provider>
  );
}

/** @param {{cart?: Promise<any>}} */
function SacolaAside({cart}) {
  return (
    <Aside type="cart" heading="Sacola">
      <Suspense fallback={<p>Carregando…</p>}>
        <Await
          resolve={cart}
          errorElement={<p>Não foi possível abrir a sacola.</p>}
        >
          {(resolvido) => <CartMain cart={resolvido} layout="aside" />}
        </Await>
      </Suspense>
    </Aside>
  );
}

/**
 * O rodapé encerra a instituição — não repete o pitch de venda (§7, cap. 13).
 */
function Rodape() {
  return (
    <footer className="rodape">
      <div className="env rodape-grade">
        <div>
          <img
            className="rodape-escudo"
            src="/manto/escudo-icone.webp"
            width="89"
            height="120"
            loading="lazy"
            alt={`Escudo do ${CANON.clube}`}
          />
        </div>
        <div>
          <p className="rodape-lockup">
            {RODAPE.lockup.map((linha) => (
              <span key={linha}>{linha}</span>
            ))}
          </p>
          <div className="rodape-links">
            <a href="#comprar">Comprar a Camisa 01</a>
            <a href="#detalhes">Detalhes da peça</a>
            <a href="#faq">Dúvidas</a>
            <Link to="/policies">Políticas</Link>
            <Link to="/account">Minha conta</Link>
          </div>
        </div>
      </div>

      <div className="env rodape-legal">
        <span>
          © {CANON.fundacao} {CANON.clube}. Todos os direitos reservados.
        </span>
        <span>
          Imagens conceituais de produto. Uniforme sujeito a ajustes de
          confecção e ao enxoval técnico da temporada.
        </span>
      </div>
    </footer>
  );
}
