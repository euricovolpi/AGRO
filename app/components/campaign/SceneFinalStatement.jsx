import {useRef} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {FINAL, CTA} from '~/lib/campaign-copy';
import {MOTION, CENAS, alturaCena} from '~/lib/campaign-motion';
import {formatPreco, formatParcela, parcelasIdeais} from '~/lib/money';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

/**
 * Capítulo 10 — a frase de venda.
 *
 * A virada para conversão. O preço aparece pela primeira vez na narrativa, e
 * vem do loader — nunca escrito no JSX da campanha, senão a campanha passa a
 * mentir no dia em que a loja mudar de preço.
 *
 * @param {{produto: any}}
 */
export function SceneFinalStatement({produto}) {
  const raiz = useRef(null);
  const {ativo, pronto} = useCampaignMotion();
  const {cenaVista, publicarUmaVez} = useCampaignAnalytics();
  const vezes = parcelasIdeais(produto?.preco);

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
          id: CENAS.final,
          trigger: raiz.current,
          start: 'top top',
          end: alturaCena('final'),
          pin: '[data-palco]',
          scrub: MOTION.scrub.narrative,
          onEnter: () => cenaVista(CENAS.final),
        },
      });

      tl.fromTo(
        '[data-final-camisa]',
        {yPercent: 12, opacity: 0},
        {yPercent: 0, opacity: 1, duration: 0.24},
        0,
      )
        .to('[data-final-linha="1"] .mask-interna', {yPercent: 0, duration: 0.26}, 0.16)
        .to('[data-final-linha="2"] .mask-interna', {yPercent: 0, duration: 0.26}, 0.3)
        .to('[data-final-preco]', {opacity: 1, y: 0, duration: 0.2}, 0.52)
        .to('[data-final-cta]', {opacity: 1, y: 0, duration: 0.18}, 0.68);

      return () => {
        ScrollTrigger.getById(CENAS.final)?.kill();
      };
    },
    {scope: raiz, dependencies: [ativo, pronto], revertOnUpdate: true},
  );

  return (
    <section className="cena cena-final" ref={raiz} aria-labelledby="final-titulo">
      <div className="cena-palco" data-palco="">
        <figure className="final-camisa" data-final-camisa="">
          <img
            src="/manto/manto-frente.webp"
            width="1166"
            height="1436"
            alt="Camisa 01, Edição Fundadora, do Agro Esporte Clube"
            loading="lazy"
            decoding="async"
          />
        </figure>

        <div className="final-copy env">
          <h2 className="d2 final-titulo" id="final-titulo">
            <span className="mask" data-final-linha="1">
              <span className="mask-linha">
                <span className="mask-interna">{FINAL.titulo[0]}</span>
              </span>
            </span>
            <span className="mask" data-final-linha="2">
              <span className="mask-linha">
                <span className="mask-interna">{FINAL.titulo[1]}</span>
              </span>
            </span>
          </h2>

          <div className="final-preco" data-final-preco="" data-surge="">
            <p className="final-produto">{FINAL.produto}</p>
            <p className="final-tecnico">
              {FINAL.indice} · {FINAL.tecnico}
            </p>
            <p className="final-valor">
              {formatPreco(produto?.preco)}
              {vezes > 1 ? (
                <span>
                  {' '}
                  · {vezes}× de {formatParcela(produto?.preco, vezes)} sem juros
                </span>
              ) : null}
            </p>
          </div>

          <a
            className="btn final-cta"
            href="#comprar"
            data-final-cta=""
            data-surge=""
            onClick={() =>
              publicarUmaVez('campaign_cta_click', 'campaign_cta_click:final', {
                placement: 'final',
              })
            }
          >
            {CTA.comSeta}
          </a>
        </div>
      </div>
    </section>
  );
}
