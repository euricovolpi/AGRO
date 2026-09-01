import {useRef} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {HERO} from '~/lib/campaign-copy';
import {MOTION, CENAS, alturaCena} from '~/lib/campaign-motion';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

/**
 * Capítulo 02 — "Nascido da terra".
 *
 * O produto não aparece aqui. O personagem está de costas diante da lavoura,
 * e a camisa existe só como silhueta — a vista frontal limpa é patrimônio do
 * capítulo 06. Por isso o único CTA deste bloco é de descoberta, não de
 * compra: nem preço, nem seletor de tamanho.
 */
export function SceneHero() {
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
          id: CENAS.hero,
          trigger: raiz.current,
          start: 'top top',
          end: alturaCena('hero'),
          pin: '[data-palco]',
          scrub: MOTION.scrub.narrative,
          onEnter: () => cenaVista(CENAS.hero),
        },
      });

      // Zoom reverso: a câmera recua devagar em vez de avançar. Dá a sensação
      // de que o plano estava fechado demais e agora respira.
      tl.fromTo('[data-figura]', {scale: 1.08}, {scale: 1.03, duration: 0.14}, 0)
        .to('[data-kicker]', {opacity: 1, y: 0, duration: 0.12}, 0.02)
        .to('[data-titulo="1"] .mask-interna', {yPercent: 0, duration: 0.18, stagger: 0.09}, 0.1)
        .to('[data-borda-luz]', {opacity: 0.7, duration: 0.16}, 0.18)
        .to('[data-figura]', {scale: 1.0, duration: 0.16}, 0.32)
        .to('[data-titulo="1"] .mask-interna', {yPercent: -108, duration: 0.14, stagger: 0.05}, 0.46)
        // Pausa deliberada entre 0.52 e 0.58: sem respiro o segundo título
        // vira continuação do primeiro, não resposta.
        .to('[data-gramado]', {opacity: 0.55, duration: 0.14}, 0.58)
        .to('[data-titulo="2"] .mask-interna', {yPercent: 0, duration: 0.18, stagger: 0.09}, 0.6)
        .to('[data-figura]', {xPercent: -1.2, duration: 0.14}, 0.7)
        .to('[data-assinatura]', {opacity: 1, y: 0, duration: 0.14}, 0.74)
        .to('[data-figura]', {opacity: 0.82, duration: 0.12}, 0.82)
        .to('[data-veu]', {opacity: 0.55, duration: 0.12}, 0.82)
        .to('[data-cta]', {opacity: 1, y: 0, duration: 0.12}, 0.86)
        .to('[data-seta]', {y: 6, duration: 0.06}, 0.96);

      return () => {
        ScrollTrigger.getById(CENAS.hero)?.kill();
      };
    },
    {scope: raiz, dependencies: [ativo, pronto], revertOnUpdate: true},
  );

  return (
    <section className="cena cena-hero" ref={raiz} aria-labelledby="hero-titulo">
      <div className="cena-palco" data-palco="">
        <figure className="hero-figura" data-figura="">
          {/* Está na segunda tela, não na primeira: carrega por proximidade
              como qualquer outra imagem do documento. */}
          <img
            src="/manto/produtor.webp"
            width="1045"
            height="1400"
            alt="Produtor rural de costas, vestindo o manto do Agro Esporte Clube diante da lavoura"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div className="hero-borda-luz" data-borda-luz="" aria-hidden="true" />
        <div className="hero-gramado" data-gramado="" aria-hidden="true" />
        <div className="hero-veu" data-veu="" aria-hidden="true" />

        <div className="hero-copy env">
          <p className="kicker hero-kicker" data-kicker="" data-surge="">
            {HERO.kicker}
          </p>

          {/* Os dois títulos ocupam a mesma caixa: o segundo entra onde o
              primeiro saiu, e a altura do bloco não muda — senão a assinatura
              e o CTA saltam no meio da troca. */}
          <div className="hero-titulos">
            <h1 className="d1 mask hero-titulo" id="hero-titulo" data-titulo="1">
              {HERO.titulo1.map((linha) => (
                <span className="mask-linha" key={linha}>
                  <span className="mask-interna">{linha}</span>
                </span>
              ))}
            </h1>

            <p className="d1 mask hero-titulo hero-titulo-2" data-titulo="2">
              {HERO.titulo2.map((linha) => (
                <span className="mask-linha" key={linha}>
                  <span className="mask-interna">{linha}</span>
                </span>
              ))}
            </p>
          </div>

          <p className="hero-assinatura" data-assinatura="" data-surge="">
            {HERO.assinatura}
          </p>

          <a className="hero-cta" href="#camisa" data-cta="" data-surge="">
            {HERO.cta} <span data-seta="" aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
