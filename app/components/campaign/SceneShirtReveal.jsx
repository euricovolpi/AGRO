import {useRef} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {REVEAL} from '~/lib/campaign-copy';
import {MOTION, CENAS, alturaCena} from '~/lib/campaign-motion';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

/**
 * Capítulo 06 — a revelação da Camisa 01.
 *
 * Primeira vez que a frente limpa da camisa aparece na página inteira. Tudo
 * antes disso foi silhueta, costas, tecido e símbolo — o reveal só tem peso
 * porque a espera foi respeitada.
 *
 * A peça pousa sobre um chão: sombra elíptica e luz vinda de cima. Camisa
 * flutuando em fundo chapado é render de catálogo, não cena.
 */
export function SceneShirtReveal() {
  const raiz = useRef(null);
  const {ativo, pronto} = useCampaignMotion();
  const {cenaVista, publicarUmaVez} = useCampaignAnalytics();

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
          id: CENAS.reveal,
          trigger: raiz.current,
          start: 'top top',
          end: alturaCena('reveal'),
          pin: '[data-palco]',
          scrub: MOTION.scrub.narrative,
          onEnter: () => {
            cenaVista(CENAS.reveal);
            publicarUmaVez('campaign_product_reveal', 'campaign_product_reveal');
          },
        },
      });

      tl.to('[data-selo-escudo]', {opacity: 0.12, scale: 0.86, duration: 0.14}, 0)
        .to('[data-frase="1"] .mask-interna', {yPercent: 0, duration: 0.14}, 0.1)
        .to('[data-frase="1"] .mask-interna', {yPercent: -108, duration: 0.1}, 0.24)
        // Vazio proposital entre 0.34 e 0.38: as duas frases ocupam o mesmo
        // ponto da tela, então elas não podem coexistir nem por um frame.
        .to('[data-frase="2"] .mask-interna', {yPercent: 0, duration: 0.12}, 0.38)
        .to('[data-frase="2"] .mask-interna', {yPercent: -108, duration: 0.1}, 0.5)
        .to('[data-luz-alta]', {opacity: 1, duration: 0.12}, 0.54)
        .fromTo(
          '[data-camisa]',
          {opacity: 0, scale: 0.72, yPercent: 6},
          {opacity: 1, scale: 0.96, yPercent: 0, duration: 0.2},
          0.54,
        )
        .fromTo('[data-chao]', {opacity: 0, scaleX: 0.4}, {opacity: 1, scaleX: 1, duration: 0.18}, 0.56)
        // Índice primeiro e pequeno; o nome do produto depois e grande. A
        // ordem é a hierarquia: quem entra por último e maior é quem a pessoa
        // leva para o checkout.
        .to('[data-reveal-indice]', {opacity: 1, y: 0, duration: 0.12}, 0.76)
        .to('[data-reveal-nome] .mask-interna', {yPercent: 0, duration: 0.16}, 0.82)
        .to('[data-tecnico]', {opacity: 1, y: 0, duration: 0.12}, 0.88)
        .to('[data-camisa]', {scale: 0.99, duration: 0.12}, 0.9);

      return () => {
        ScrollTrigger.getById(CENAS.reveal)?.kill();
      };
    },
    {scope: raiz, dependencies: [ativo, pronto], revertOnUpdate: true},
  );

  return (
    <section className="cena cena-reveal" id="camisa" ref={raiz} aria-labelledby="reveal-marca">
      <div className="cena-palco" data-palco="">
        <div className="reveal-luz" data-luz-alta="" aria-hidden="true" />

        <img
          className="reveal-selo-escudo"
          data-selo-escudo=""
          src="/manto/escudo.webp"
          width="667"
          height="900"
          alt=""
          aria-hidden="true"
          loading="lazy"
        />

        <p className="d3 mask reveal-frase" data-frase="1">
          <span className="mask-linha">
            <span className="mask-interna">{REVEAL.frase1}</span>
          </span>
        </p>
        <p className="d3 mask reveal-frase" data-frase="2">
          <span className="mask-linha">
            <span className="mask-interna">{REVEAL.frase2}</span>
          </span>
        </p>

        <p className="reveal-indice" data-reveal-indice="" data-surge="">
          {REVEAL.indice}
        </p>

        <h2 className="mask reveal-nome" id="reveal-marca" data-reveal-nome="">
          <span className="mask-linha">
            <span className="mask-interna">{REVEAL.nome}</span>
          </span>
        </h2>

        <figure className="reveal-camisa" data-camisa="">
          <img
            src="/manto/manto-frente.webp"
            width="1166"
            height="1436"
            alt="Frente da Camisa 01, Edição Fundadora: manto verde-escuro com gola em V dourada e escudo bordado"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <i className="reveal-chao" data-chao="" aria-hidden="true" />

        <div className="reveal-pe">
          <p className="reveal-tecnico" data-tecnico="" data-surge="">
            {REVEAL.tecnico}
          </p>
        </div>
      </div>
    </section>
  );
}
