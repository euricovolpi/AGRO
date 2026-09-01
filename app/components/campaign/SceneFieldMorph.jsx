import {useEffect, useMemo, useRef, useState} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {CAMPO} from '~/lib/campaign-copy';
import {MOTION, CENAS, alturaCena} from '~/lib/campaign-motion';
import {caminhoInterpolado, geometriaCampo} from '~/lib/campaign-field';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

/**
 * Capítulo 03 — "Do campo para o campo". A assinatura do site.
 *
 * As ruas da lavoura não somem para dar lugar a um campo: elas *viram* o
 * campo. Cada linha tem forma inicial e forma-alvo com a mesma contagem de
 * pontos (ver `campaign-field.js`), e o scroll interpola ponto a ponto. Sem
 * MorphSVG, sem crossfade, sem ícone pronto entrando por fade.
 *
 * O SSR já entrega o campo desenhado: sem JS a cena é uma marcação de campo
 * com legenda, que continua dizendo o que a transformação diria.
 */
export function SceneFieldMorph() {
  const raiz = useRef(null);
  const {reduzido, faixa} = useCampaignMotion();
  const {cenaVista} = useCampaignAnalytics();
  const [vertical, setVertical] = useState(false);

  useEffect(() => {
    const mq = matchMedia('(max-width: 639px)');
    const aplicar = () => setVertical(mq.matches);
    aplicar();
    mq.addEventListener('change', aplicar);
    return () => mq.removeEventListener('change', aplicar);
  }, []);

  // Mobile carrega menos paths: menos geometria para interpolar por frame e
  // um campo que ainda se lê em 390 px de largura.
  const geo = useMemo(
    () => geometriaCampo({vertical, total: vertical ? 15 : undefined}),
    [vertical],
  );

  useGSAP(
    () => {
      const paths = gsap.utils.toArray('[data-linha-campo]');
      if (!paths.length) return;

      if (reduzido) {
        // Estado final estático: o campo montado, com a legenda ao lado.
        paths.forEach((p, i) => {
          p.setAttribute('d', caminhoInterpolado(geo.linhas[i], 1));
          p.style.opacity = '1';
        });
        return;
      }

      // O CSS esconde a linha com translateY(108%), mas o GSAP converte esse
      // percentual em pixels e o guarda no canal `y` — que soma com o
      // `yPercent` das timelines abaixo. Normalizar aqui deixa a máscara num
      // canal só, senão a linha aparece na saída em vez da entrada.
      gsap.set('.mask-interna', {yPercent: 108, y: 0});

      const estado = {p: 0};

      function desenhar() {
        for (let i = 0; i < paths.length; i++) {
          const linha = geo.linhas[i];
          const bruto = (estado.p - linha.inicio) / (linha.fim - linha.inicio);
          const t = bruto <= 0 ? 0 : bruto >= 1 ? 1 : bruto;
          paths[i].setAttribute('d', caminhoInterpolado(linha, t));
          paths[i].style.opacity = String(0.34 + t * 0.66);
        }
      }

      desenhar();

      const tl = gsap.timeline({
        scrollTrigger: {
          id: CENAS.campo,
          trigger: raiz.current,
          start: 'top top',
          end: alturaCena('field'),
          pin: '[data-palco]',
          scrub: MOTION.scrub.narrative,
          onEnter: () => cenaVista(CENAS.campo),
        },
      });

      tl.to(estado, {p: 1, ease: 'none', duration: 1, onUpdate: desenhar}, 0)
        // Sobrevoo: a lavoura desliza antes de começar a se reorganizar.
        .fromTo('[data-svg-campo]', {yPercent: 6}, {yPercent: 0, ease: 'none', duration: 0.5}, 0)
        .to('[data-indice-campo]', {opacity: 1, y: 0, duration: 0.1}, 0.02)
        .to('[data-campo-titulo="1"] .mask-interna', {yPercent: 0, duration: 0.16}, 0.16)
        .to('[data-campo-titulo="2"] .mask-interna', {yPercent: 0, duration: 0.16}, 0.46)
        // O ouro cede para creme quando a geometria vira campo: a lavoura
        // termina, o jogo começa. Tween direto no stroke do grupo — variável
        // CSS animada aqui dependeria de @property para interpolar cor.
        .to('[data-tracos]', {stroke: '#ebdcc2', duration: 0.14}, 0.76)
        .to('[data-svg-campo]', {scale: 0.94, yPercent: -4, duration: 0.1}, 0.9)
        .to('[data-textura-campo]', {opacity: 0.06, duration: 0.1}, 0.9);

      return () => {
        ScrollTrigger.getById(CENAS.campo)?.kill();
      };
    },
    {scope: raiz, dependencies: [reduzido, geo, faixa], revertOnUpdate: true},
  );

  return (
    <section className="cena cena-campo" ref={raiz} aria-labelledby="campo-titulo">
      <div className="cena-palco" data-palco="">
        <div className="campo-textura" data-textura-campo="" aria-hidden="true" />

        <svg
          className="campo-svg"
          data-svg-campo=""
          viewBox={geo.viewBox}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-labelledby="campo-svg-titulo"
        >
          <title id="campo-svg-titulo">
            As linhas de uma plantação se reorganizam até formar as marcações
            de um campo de futebol.
          </title>
          <g
            data-tracos=""
            fill="none"
            stroke="#c6a15b"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {geo.linhas.map((linha) => (
              <path
                key={linha.id}
                data-linha-campo=""
                d={caminhoInterpolado(linha, 1)}
              />
            ))}
          </g>
        </svg>

        <div className="campo-copy env">
          <p className="mn-num" data-indice-campo="" data-surge="">
            {CAMPO.indice}
          </p>
          <h2 className="d2 campo-titulo" id="campo-titulo">
            <span className="mask" data-campo-titulo="1">
              <span className="mask-linha">
                <span className="mask-interna">{CAMPO.titulo1}</span>
              </span>
            </span>
            <span className="mask" data-campo-titulo="2">
              <span className="mask-linha">
                <span className="mask-interna">{CAMPO.titulo2}</span>
              </span>
            </span>
          </h2>
          <p className="campo-legenda">{CAMPO.legendaEstatica}</p>
        </div>
      </div>
    </section>
  );
}
