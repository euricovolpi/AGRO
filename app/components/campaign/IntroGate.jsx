import {useRef} from 'react';
import {gsap, useGSAP} from '~/lib/gsap';
import {PROLOGO} from '~/lib/campaign-copy';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';

const CHAVE = 'agro-intro';

/**
 * Capítulo 00 — prólogo (§7 da spec).
 *
 * Cortina de tempo, não de scroll. Máximo 1,8 s na primeira visita, 0,35 s na
 * repetida, zero em movimento reduzido ou entrada por hash — e essas duas
 * últimas decisões já foram tomadas pelo script inline do root, antes da
 * primeira pintura, para o prólogo nunca chegar a piscar.
 *
 * O overlay é decorativo: `aria-hidden`, sem foco, e o h1 real da página vive
 * atrás dele desde o HTML servido. Nada de barra falsa de porcentagem, nada
 * de esperar todas as imagens.
 */
export function IntroGate() {
  const raiz = useRef(null);
  const {reduzido} = useCampaignMotion();

  useGSAP(
    () => {
      const el = raiz.current;
      if (!el) return;

      const raizHtml = document.documentElement;
      const jaVista =
        reduzido ||
        raizHtml.classList.contains('intro-vista') ||
        sessionStorage.getItem(CHAVE) === '1';

      if (jaVista) {
        raizHtml.classList.add('intro-vista');
        gsap.set(el, {display: 'none'});
        return;
      }

      raizHtml.classList.add('intro-ativa');
      sessionStorage.setItem(CHAVE, '1');

      const tl = gsap.timeline({
        defaults: {ease: 'power3.out'},
        onComplete: () => {
          raizHtml.classList.remove('intro-ativa');
          raizHtml.classList.add('intro-vista');
          gsap.set(el, {display: 'none'});
        },
      });

      tl.to('[data-intro-linha]', {
        yPercent: 0,
        duration: 0.4,
        stagger: 0.16,
      })
        .fromTo(
          '[data-intro-cidade]',
          {letterSpacing: '0.34em'},
          {letterSpacing: '0.22em', duration: 0.4},
          0.28,
        )
        // A linha nasce aqui e é a mesma que abre o capítulo 01: o corte entre
        // prólogo e página não pode existir.
        .fromTo(
          '[data-intro-regua]',
          {scaleX: 0},
          {scaleX: 1, duration: 0.56, ease: 'power2.inOut'},
          0.72,
        )
        .to('[data-intro-lockup]', {scale: 0.96, opacity: 0, duration: 0.32}, 1.28)
        .to(el, {clipPath: 'inset(0 0 100% 0)', duration: 0.2}, 1.6);

      return () => {
        raizHtml.classList.remove('intro-ativa');
      };
    },
    {scope: raiz, dependencies: [reduzido], revertOnUpdate: true},
  );

  return (
    <div className="intro" ref={raiz} aria-hidden="true">
      <div className="intro-lockup" data-intro-lockup="">
        <span className="intro-linha">
          <span data-intro-linha="">{PROLOGO.linhas[0]}</span>
        </span>
        <span className="intro-linha intro-cidade" data-intro-cidade="">
          <span data-intro-linha="">{PROLOGO.linhas[1]}</span>
        </span>
        <span className="intro-linha intro-ano">
          <span data-intro-linha="">{PROLOGO.linhas[2]}</span>
        </span>
      </div>
      <i className="intro-regua" data-intro-regua="" />
    </div>
  );
}
