import {useRef} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {ORIGEM} from '~/lib/campaign-copy';
import {MOTION, CENAS, alturaCena} from '~/lib/campaign-motion';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

/**
 * Capítulo 01 — a linha nasce.
 *
 * A régua dourada que fecha o prólogo é a mesma que abre aqui: ela cresce, a
 * terra aparece por baixo, o céu por cima, e no fim ela deixou de ser um
 * traço gráfico para virar horizonte. Nada de cortar para outra imagem — a
 * leitura precisa ser de enquadramento que abriu.
 */
export function SceneOriginLine() {
  const raiz = useRef(null);
  const {reduzido} = useCampaignMotion();
  const {cenaVista} = useCampaignAnalytics();

  useGSAP(
    () => {
      if (reduzido) return;

      // O CSS esconde a linha com translateY(108%), mas o GSAP converte esse
      // percentual em pixels e o guarda no canal `y` — que soma com o
      // `yPercent` das timelines abaixo. Normalizar aqui deixa a máscara num
      // canal só, senão a linha aparece na saída em vez da entrada.
      gsap.set('.mask-interna', {yPercent: 108, y: 0});

      const tl = gsap.timeline({
        scrollTrigger: {
          id: CENAS.origem,
          trigger: raiz.current,
          start: 'top top',
          end: alturaCena('origin'),
          pin: '[data-palco]',
          scrub: MOTION.scrub.narrative,
          onEnter: () => cenaVista(CENAS.origem),
        },
      });

      tl.to('[data-regua]', {width: '82vw', duration: 0.16}, 0)
        // O brilho é um elemento próprio: tween de box-shadow repinta a cena
        // inteira a cada frame, e o teto de 0.14 existe para a linha nunca
        // virar neon.
        .to('[data-regua-brilho]', {opacity: 0.14, duration: 0.1}, 0.06)
        .fromTo(
          '[data-terra]',
          {clipPath: 'inset(0 0 100% 0)'},
          {clipPath: 'inset(0 0 0% 0)', duration: 0.16},
          0.1,
        )
        .fromTo(
          '[data-ceu]',
          {clipPath: 'inset(100% 0 0 0)'},
          {clipPath: 'inset(0% 0 0 0)', duration: 0.2},
          0.18,
        )
        .to(
          '[data-frase="1"] .mask-interna',
          {yPercent: 0, duration: 0.22, stagger: 0.06},
          0.26,
        )
        .to('[data-halo]', {opacity: 0.55, duration: 0.18}, 0.44)
        .to(
          '[data-frase="1"] .mask-interna',
          {yPercent: -108, duration: 0.14, stagger: 0.04},
          0.54,
        )
        .to(
          '[data-frase="2"] .mask-interna',
          {yPercent: 0, duration: 0.18, stagger: 0.06},
          0.72,
        )
        .to('[data-terra]', {scaleY: 1.18, duration: 0.18}, 0.72)
        .to('[data-ceu]', {scaleY: 1.1, duration: 0.18}, 0.72)
        .to('[data-copy]', {yPercent: -18, duration: 0.1}, 0.9);

      return () => {
        ScrollTrigger.getById(CENAS.origem)?.kill();
      };
    },
    {scope: raiz, dependencies: [reduzido], revertOnUpdate: true},
  );

  return (
    <section className="cena cena-origem" id="origem" ref={raiz}>
      <div className="cena-palco" data-palco="">
        <div className="origem-ceu" data-ceu="" aria-hidden="true" />
        <div className="origem-terra" data-terra="" aria-hidden="true" />
        <div className="origem-halo" data-halo="" aria-hidden="true" />
        <i className="origem-regua" data-regua="" aria-hidden="true">
          <i className="origem-regua-brilho" data-regua-brilho="" />
        </i>

        <div className="origem-copy env" data-copy="">
          <p className="mn-num">{ORIGEM.indice}</p>

          {/* Mesma caixa para as duas frases: a segunda substitui a primeira
              no lugar exato onde ela estava, sem cruzar no meio da troca. */}
          <div className="origem-frases">
            <h2 className="d2 mask origem-frase" data-frase="1">
              {ORIGEM.frases[0].map((linha) => (
                <span className="mask-linha" key={linha}>
                  <span className="mask-interna">{linha}</span>
                </span>
              ))}
            </h2>

            <p className="d2 mask origem-frase origem-frase-2" data-frase="2">
              {ORIGEM.frases[1].map((linha) => (
                <span className="mask-linha" key={linha}>
                  <span className="mask-interna">{linha}</span>
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
