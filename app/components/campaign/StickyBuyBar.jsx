import {useEffect, useState} from 'react';
import {formatPreco} from '~/lib/money';
import {CANON, CTA} from '~/lib/campaign-copy';

/**
 * Barra de compra fixa (§8 da spec).
 *
 * O gatilho não é uma altura arbitrária de scroll: ela só nasce depois que a
 * Camisa 01 foi revelada — antes disso não existe produto na cabeça de quem
 * lê. E some enquanto o configurador ou o rodapé estão na tela, para não
 * duplicar o CTA nem cobrir formulário.
 *
 * @param {{produto: any}}
 */
export function StickyBuyBar({produto}) {
  const [passouReveal, setPassouReveal] = useState(false);
  const [bloqueada, setBloqueada] = useState(false);

  useEffect(() => {
    const reveal = document.getElementById('camisa');
    const comprar = document.getElementById('comprar');
    const rodape = document.querySelector('.rodape');

    const obs = [];

    if (reveal) {
      const o = new IntersectionObserver(
        ([e]) => {
          // Passou do reveal quando a cena saiu inteira por cima da viewport.
          // Rolar de volta para antes dela precisa desligar a barra de novo —
          // senão ela fica presa no topo da página depois da primeira visita.
          setPassouReveal(e.boundingClientRect.bottom < 0);
        },
        {threshold: 0},
      );
      o.observe(reveal);
      obs.push(o);
    }

    const alvosBloqueio = [comprar, rodape].filter(Boolean);
    if (alvosBloqueio.length) {
      const visiveis = new Set();
      const o = new IntersectionObserver(
        (entradas) => {
          entradas.forEach((e) => {
            if (e.isIntersecting) visiveis.add(e.target);
            else visiveis.delete(e.target);
          });
          setBloqueada(visiveis.size > 0);
        },
        {threshold: 0.02},
      );
      alvosBloqueio.forEach((a) => o.observe(a));
      obs.push(o);
    }

    return () => obs.forEach((o) => o.disconnect());
  }, []);

  const visivel = passouReveal && !bloqueada;

  return (
    <div className={`barra-compra${visivel ? ' visivel' : ''}`} aria-hidden={!visivel}>
      <div className="barra-info">
        <img
          src="/manto/manto-frente.webp"
          width="1166"
          height="1436"
          alt=""
          aria-hidden="true"
        />
        <div>
          <strong>{CANON.produto}</strong>
          <span>{formatPreco(produto?.preco)}</span>
        </div>
      </div>
      <a className="btn" href="#comprar" tabIndex={visivel ? 0 : -1}>
        {CTA.principal}
      </a>
    </div>
  );
}
