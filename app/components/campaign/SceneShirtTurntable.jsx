import {useRef} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {CALLOUTS} from '~/lib/campaign-copy';
import {MOTION, CENAS, alturaCena} from '~/lib/campaign-motion';
import {useImageSequence} from '~/hooks/useImageSequence';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

/**
 * Mapa progresso → ângulo do fallback de duas faces.
 *
 * Um plano girando em Y vira um fio de cabelo perto de 90° e 270°. Com giro
 * linear a peça passa tempo demais nesses ângulos e o efeito denuncia que não
 * há 360 real. Aqui os perfis são passagens rápidas, e frente (0°), costas
 * (180°) e frente de volta (360°) seguram nos mesmos pontos da timeline da
 * sequência verdadeira.
 */
const PERFIS = [
  [0.0, 0],
  [0.25, 70],
  [0.3, 110],
  [0.48, 180],
  [0.57, 180],
  [0.72, 250],
  [0.77, 290],
  [0.96, 360],
  [1.0, 360],
];

/** @param {number} p */
function anguloFallback(p) {
  for (let i = 1; i < PERFIS.length; i++) {
    const [p1, a1] = PERFIS[i];
    if (p <= p1) {
      const [p0, a0] = PERFIS[i - 1];
      const t = p1 === p0 ? 0 : (p - p0) / (p1 - p0);
      return a0 + (a1 - a0) * t;
    }
  }
  return 360;
}

/** Janelas de progresso de cada anotação, conforme a timeline da spec. */
const JANELAS = [
  {de: 0.0, ate: 0.3},
  {de: 0.16, ate: 0.48},
  {de: 0.52, ate: 0.68},
  {de: 0.68, ate: 0.9},
];

/**
 * Capítulo 07 — a camisa em rotação.
 *
 * Com a sequência de 72 frames presente, roda em canvas. Sem ela, cai no
 * fallback de duas faces marcado com `data-motion-fallback="two-face"` — e
 * nesse modo o recurso nunca é chamado de "360", nem no texto nem no evento.
 *
 * Os callouts são anotação de projeto, não hotspot de e-commerce: índice em
 * ouro, uma dobra na linha, e saem de cena antes de cruzar a silhueta.
 *
 * @param {{disponivelFrames?: boolean}} [props]
 */
export function SceneShirtTurntable() {
  const raiz = useRef(null);
  const canvasRef = useRef(null);
  const {reduzido} = useCampaignMotion();
  const {cenaVista, evento} = useCampaignAnalytics();
  const {disponivel, desenhar, total} = useImageSequence({ativo: !reduzido});

  const usaSequencia = disponivel === true && !reduzido;

  useGSAP(
    () => {
      if (reduzido || disponivel === null) return;

      const estado = {p: 0};

      function aplicar() {
        const p = estado.p;

        if (usaSequencia) {
          desenhar(canvasRef.current, p * (total - 1));
        } else {
          const alvo = raiz.current?.querySelector('[data-duas-faces]');
          if (alvo) {
            alvo.style.setProperty('--giro', `${anguloFallback(p).toFixed(2)}deg`);
          }
        }
      }

      aplicar();

      const tl = gsap.timeline({
        scrollTrigger: {
          id: CENAS.turntable,
          trigger: raiz.current,
          start: 'top top',
          end: alturaCena('turntable'),
          pin: '[data-palco]',
          scrub: MOTION.scrub.product,
          onEnter: () => cenaVista(CENAS.turntable),
          onLeave: () => evento('campaign_turntable_complete'),
        },
      });

      tl.to(estado, {p: 1, ease: 'none', duration: 1, onUpdate: aplicar}, 0);

      // Cada anotação entra e sai na própria janela. Nada de todas piscando
      // juntas no meio do giro.
      CALLOUTS.forEach((c, i) => {
        const janela = JANELAS[i];
        const seletor = `[data-callout="${c.id}"]`;
        tl.fromTo(
          seletor,
          {opacity: 0, x: c.lado === 'direita' ? 18 : -18},
          {opacity: 1, x: 0, duration: 0.06},
          janela.de,
        )
          .fromTo(
            `${seletor} [data-callout-linha]`,
            {scaleX: 0},
            {scaleX: 1, duration: 0.06, ease: 'power2.inOut'},
            janela.de + 0.02,
          )
          .to(seletor, {opacity: 0, duration: 0.05}, janela.ate);
      });

      return () => {
        ScrollTrigger.getById(CENAS.turntable)?.kill();
      };
    },
    {scope: raiz, dependencies: [reduzido, disponivel, usaSequencia, total], revertOnUpdate: true},
  );

  return (
    <section
      className="cena cena-turntable"
      ref={raiz}
      aria-labelledby="turntable-titulo"
      data-motion-fallback={usaSequencia ? undefined : 'two-face'}
    >
      <div className="cena-palco" data-palco="">
        <h2 className="vis-oculto" id="turntable-titulo">
          A Camisa 01 vista por todos os lados
        </h2>

        <figure className="turntable-figura">
          {usaSequencia ? (
            <canvas
              className="turntable-canvas"
              ref={canvasRef}
              aria-hidden="true"
            />
          ) : (
            <div className="turntable-faces" data-duas-faces="">
              <img
                className="turntable-face frente"
                src="/manto/manto-frente.webp"
                width="1166"
                height="1436"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
              />
              <img
                className="turntable-face costas"
                src="/manto/manto-costas.webp"
                width="1231"
                height="1500"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          <figcaption className="vis-oculto">
            A Camisa 01 girando: frente com o escudo bordado e o acabamento
            dourado na gola e nos punhos, costas com a numeração em relevo.
          </figcaption>
        </figure>

        <ul className="turntable-callouts">
          {CALLOUTS.map((c) => (
            <li
              key={c.id}
              className={`callout callout-${c.lado}`}
              data-callout={c.id}
            >
              <i data-callout-linha="" aria-hidden="true" />
              <span className="callout-indice">{c.indice}</span>
              <span className="callout-titulo">{c.titulo}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
