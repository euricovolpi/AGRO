import {useRef, useState} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {DETALHES_CAMPANHA} from '~/lib/campaign-copy';
import {MOTION, CENAS} from '~/lib/campaign-motion';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

/**
 * Capítulo 08 — microdetalhes.
 *
 * Cinco passagens em ordem fixa. O índice fica grudado na lateral e marca
 * onde a leitura está: sem ele, cinco macros seguidos viram um carrossel sem
 * hierarquia. Alinhamento alterna a cada item para o olho não cair no mesmo
 * eixo cinco vezes.
 *
 * Nada aqui depende de hover: em toque, tudo já está visível.
 */
export function SceneDetails() {
  const raiz = useRef(null);
  const {reduzido} = useCampaignMotion();
  const {cenaVista} = useCampaignAnalytics();
  const [ativo, setAtivo] = useState(0);

  useGSAP(
    () => {
      const itens = gsap.utils.toArray('[data-detalhe]');

      // O índice acompanha a leitura mesmo em movimento reduzido — é
      // orientação, não animação.
      const marcadores = itens.map((item, i) =>
        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          end: 'bottom 38%',
          onToggle: ({isActive}) => isActive && setAtivo(i),
          onEnter: i === 0 ? () => cenaVista(CENAS.detalhes) : undefined,
        }),
      );

      if (reduzido) return () => marcadores.forEach((m) => m.kill());

      // O CSS esconde a linha com translateY(108%), mas o GSAP converte esse
      // percentual em pixels e o guarda no canal `y` — que soma com o
      // `yPercent` das timelines abaixo. Normalizar aqui deixa a máscara num
      // canal só, senão a linha aparece na saída em vez da entrada.
      gsap.set('.mask-interna', {yPercent: 108, y: 0});

      const tweens = itens.map((item) => {
        const figura = item.querySelector('[data-detalhe-figura]');
        const imagem = item.querySelector('img');
        const copy = item.querySelector('[data-detalhe-copy]');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 82%',
            end: 'bottom 55%',
            scrub: MOTION.scrub.narrative,
          },
        });

        tl.to(figura, {clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3}, 0)
          .fromTo(imagem, {scale: 1}, {scale: 1.06, ease: 'none', duration: 1}, 0)
          .to(copy?.querySelectorAll('.mask-interna') ?? [], {yPercent: 0, duration: 0.28, stagger: 0.06}, 0.12);

        return tl;
      });

      return () => {
        marcadores.forEach((m) => m.kill());
        tweens.forEach((t) => t.scrollTrigger?.kill());
      };
    },
    {scope: raiz, dependencies: [reduzido], revertOnUpdate: true},
  );

  return (
    <section className="cena-detalhes" id="detalhes" ref={raiz} aria-labelledby="detalhes-titulo">
      <div className="env">
        <p className="mn-num">Ato II · Símbolo</p>
        <h2 className="d2" id="detalhes-titulo">
          Costura
          <br />
          por costura.
        </h2>
      </div>

      <div className="env detalhes-grade">
        <ol className="detalhes-indice" aria-hidden="true">
          {DETALHES_CAMPANHA.map((d, i) => (
            <li key={d.indice} className={i === ativo ? 'ativo' : undefined}>
              <span>{d.indice}</span> {d.rotulo}
            </li>
          ))}
        </ol>

        <div className="detalhes-lista">
          {DETALHES_CAMPANHA.map((d, i) => (
            <article
              className={`detalhe${i % 2 ? ' invertido' : ''}`}
              key={d.indice}
              data-detalhe=""
            >
              <figure
                className="detalhe-figura"
                data-detalhe-figura=""
                data-clip={i % 2 ? 'direita' : 'baixo'}
              >
                <img
                  src={d.imagem}
                  width={d.largura}
                  height={d.altura}
                  alt={d.alt}
                  loading="lazy"
                  decoding="async"
                />
              </figure>

              <div className="detalhe-copy" data-detalhe-copy="">
                <p className="detalhe-rotulo mask">
                  <span className="mask-linha">
                    <span className="mask-interna">
                      {d.indice} / {d.rotulo}
                    </span>
                  </span>
                </p>
                <p className="detalhe-frase mask">
                  <span className="mask-linha">
                    <span className="mask-interna">{d.frase}</span>
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
