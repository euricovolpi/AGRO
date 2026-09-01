import {APOIO} from '~/lib/campaign-copy';
import {CALENDARIO, FAQ, FICHA, IMPRENSA} from '~/lib/manto';
import {Reveal} from '~/components/Fx';

/**
 * Capítulo 12 — apoio comercial.
 *
 * Depois da compra, o que sobra é informação: ficha, calendário, imprensa e
 * dúvidas. Aqui o movimento é discreto de propósito — reabrir o clímax
 * depois do CTA só atrasa quem já decidiu, e cansa quem ainda está lendo.
 *
 * Sem card arredondado e sem sombra de dashboard: régua, grade e lista.
 */
export function CommercialSupport() {
  return (
    <div className="apoio">
      {/* ---------------------- Ficha técnica ---------------------- */}
      <section className="mn-secao" aria-labelledby="apoio-ficha">
        <div className="env mn-ficha-grade">
          <Reveal className="mn-ficha-macro">
            <img
              src="/manto/detalhe-tecido.webp"
              width="676"
              height="373"
              alt="Macro da malha com jacquard em relevo no formato de espiga"
              loading="lazy"
              decoding="async"
            />
          </Reveal>
          <Reveal delay={100}>
            <p className="mn-num">Ficha técnica</p>
            <h2 className="d3" id="apoio-ficha">
              {APOIO.ficha}
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
      </section>

      {/* ----------------------- Calendário ------------------------ */}
      <section className="mn-secao" id="calendario" aria-labelledby="apoio-calendario">
        <div className="env">
          <Reveal>
            <p className="mn-num">Temporada 2027</p>
            <h2 className="d3" id="apoio-calendario">
              {APOIO.calendario}
            </h2>
          </Reveal>
          <Reveal delay={100} style={{marginTop: 'clamp(1.6rem, 3vw, 2.4rem)'}}>
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

      {/* ------------------------ Imprensa ------------------------- */}
      <section className="mn-secao" aria-labelledby="apoio-imprensa">
        <div className="env mn-duas">
          <Reveal as="header">
            <p className="mn-num">Repercussão</p>
            <h2 className="d3" id="apoio-imprensa">
              {APOIO.imprensa}
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

      {/* -------------------------- FAQ ---------------------------- */}
      <section className="mn-secao" id="faq" aria-labelledby="apoio-faq">
        <div className="env mn-duas">
          <Reveal as="header">
            <p className="mn-num">Dúvidas</p>
            <h2 className="d3" id="apoio-faq">
              {APOIO.faq}
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
    </div>
  );
}
