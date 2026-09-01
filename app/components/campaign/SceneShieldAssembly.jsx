import {useRef} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {ESCUDO} from '~/lib/campaign-copy';
import {MOTION, CENAS, alturaCena} from '~/lib/campaign-motion';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

/**
 * Capítulo 05 — o escudo nasce.
 *
 * TODO(asset): substituir pelo SVG segmentado do escudo (grupos: estrela,
 * contorno, ramos, sol, lavoura, tipografia AGRO, ano, ornamentos). Enquanto
 * ele não existe, a cena roda no fallback declarado pela spec: o escudo
 * completo em `escudo.webp`, montado por máscara, luz e escala.
 *
 * O fallback recorta o PNG por faixas horizontais de revelação — nunca em
 * retângulos que fingem ser peças soltas. A leitura é de convergência e
 * instituição, não de logo reveal esportivo.
 */
export function SceneShieldAssembly() {
  const raiz = useRef(null);
  const {ativo, pronto} = useCampaignMotion();
  const {cenaVista} = useCampaignAnalytics();

  useGSAP(
    () => {
      if (!ativo || !pronto) return;

      // O CSS esconde a linha com translateY(108%), mas o GSAP converte esse
      // percentual em pixels e o guarda no canal `y` — que soma com o
      // `yPercent` das timelines abaixo. Normalizar aqui deixa a máscara num
      // canal só, senão a linha aparece na saída em vez da entrada.
      gsap.set('.mask-interna', {yPercent: 108, y: 0});

      const tl = gsap.timeline({
        scrollTrigger: {
          id: CENAS.escudo,
          trigger: raiz.current,
          start: 'top top',
          end: alturaCena('shield'),
          pin: '[data-palco]',
          scrub: MOTION.scrub.narrative,
          onEnter: () => cenaVista(CENAS.escudo),
        },
      });

      tl.fromTo('[data-ponto-luz]', {scale: 0.2, opacity: 0}, {scale: 1, opacity: 1, duration: 0.12}, 0)
        // A base é desenhada primeiro: a lavoura sustenta o resto do símbolo.
        .fromTo(
          '[data-base]',
          {scaleX: 0},
          {scaleX: 1, duration: 0.16, ease: 'power2.inOut'},
          0.02,
        )
        .fromTo(
          '[data-escudo]',
          {
            clipPath: 'inset(72% 12% 0% 12%)',
            scale: 0.72,
            opacity: 0,
            yPercent: 8,
          },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            opacity: 1,
            yPercent: 0,
            duration: 0.5,
          },
          0.1,
        )
        .to('[data-ponto-luz]', {opacity: 0, duration: 0.12}, 0.2)
        .fromTo('[data-halo-escudo]', {opacity: 0}, {opacity: 0.6, duration: 0.2}, 0.3)
        // Sweep único: o metal pega a luz uma vez e para. Repetir vira GIF.
        .fromTo('[data-sweep]', {xPercent: -140, opacity: 0}, {xPercent: 140, opacity: 1, duration: 0.16}, 0.62)
        .to('[data-sweep]', {opacity: 0, duration: 0.04}, 0.78)
        .to('[data-halo-escudo]', {opacity: 0.32, duration: 0.1}, 0.78)
        .to('[data-escudo-titulo] .mask-interna', {yPercent: 0, duration: 0.16, stagger: 0.07}, 0.82)
        .to('[data-escudo]', {scale: 0.62, duration: 0.1}, 0.96);

      return () => {
        ScrollTrigger.getById(CENAS.escudo)?.kill();
      };
    },
    {scope: raiz, dependencies: [ativo, pronto], revertOnUpdate: true},
  );

  return (
    <section className="cena cena-escudo" ref={raiz} aria-labelledby="escudo-titulo">
      <div className="cena-palco" data-palco="">
        <div className="escudo-halo" data-halo-escudo="" aria-hidden="true" />
        <i className="escudo-ponto" data-ponto-luz="" aria-hidden="true" />

        <div className="escudo-palco">
          <figure className="escudo-figura" data-escudo="">
            <img
              src="/manto/escudo.webp"
              width="667"
              height="900"
              alt="Escudo do Agro Esporte Clube: sol nascendo sobre a lavoura, ramos de louro, 2026 na base e uma estrela acima"
              loading="lazy"
              decoding="async"
            />
            <i className="escudo-sweep" data-sweep="" aria-hidden="true" />
          </figure>
          <i className="escudo-base" data-base="" aria-hidden="true" />
        </div>

        <div className="escudo-copy env">
          <p className="mn-num">{ESCUDO.indice}</p>
          <h2 className="d3 mask" id="escudo-titulo" data-escudo-titulo="">
            {ESCUDO.titulo.map((linha) => (
              <span className="mask-linha" key={linha}>
                <span className="mask-interna">{linha}</span>
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  );
}
