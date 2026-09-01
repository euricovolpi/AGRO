import {useRef} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {ORIGEM, PROLOGO} from '~/lib/campaign-copy';
import {MOTION, CENAS, alturaCena} from '~/lib/campaign-motion';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

const CHAVE_INTRO = 'agro-intro';

/**
 * Capítulos 00 e 01 — o prólogo e a linha que nasce.
 *
 * Os dois vivem no mesmo componente por uma razão só: **a linha dourada é um
 * único elemento DOM**. Ela nasce no prólogo, sobrevive à saída do lockup e
 * vira o horizonte da origem sem nunca ser destruída e recriada. Como cortina
 * separada eram dois elementos, em coordenadas diferentes, e a emenda entre os
 * capítulos aparecia como um salto.
 *
 * Isso também dispensa um overlay opaco: no topo da página este palco já ocupa
 * a viewport inteira, então o prólogo é o primeiro quadro da cena e não uma
 * tela por cima dela.
 *
 * O prólogo é temporal — no máximo 1,8 s, e zero em visita repetida, movimento
 * reduzido ou entrada por hash. A origem é dirigida por scroll, e a sua
 * timeline só é montada quando o prólogo termina: as duas animam a largura da
 * mesma linha, e sobrepô-las faria uma brigar com a outra.
 */
export function SceneOriginLine() {
  const raiz = useRef(null);
  const {ativo} = useCampaignMotion();
  const {cenaVista} = useCampaignAnalytics();

  useGSAP(
    () => {
      if (!ativo) return undefined;

      // O CSS esconde a linha com translateY(108%), mas o GSAP converte esse
      // percentual em pixels e o guarda no canal `y` — que soma com o
      // `yPercent` das timelines abaixo. Normalizar aqui deixa a máscara num
      // canal só, senão a linha aparece na saída em vez da entrada.
      gsap.set('.mask-interna', {yPercent: 108, y: 0});
      // As linhas do prólogo escondem-se pelo mesmo mecanismo e sofrem do
      // mesmo desencontro de canal.
      gsap.set('[data-intro-linha]', {yPercent: 110, y: 0});

      const raizHtml = document.documentElement;
      const pularIntro =
        raizHtml.classList.contains('intro-vista') ||
        sessionStorage.getItem(CHAVE_INTRO) === '1';

      /** Timeline de scroll da origem. Montada depois do prólogo, ou já. */
      function montarOrigem() {
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

        // A linha continua exatamente de onde o prólogo a deixou: 34vw, mesma
        // posição, mesma espessura, mesma cor. Ela só cresce.
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
      }

      if (pularIntro) {
        raizHtml.classList.add('intro-vista');
        gsap.set('[data-prologo]', {display: 'none'});
        gsap.set('[data-regua]', {width: '34vw'});
        montarOrigem();
        return () => {
          ScrollTrigger.getById(CENAS.origem)?.kill();
        };
      }

      raizHtml.classList.add('intro-ativa');

      const intro = gsap.timeline({
        defaults: {ease: 'power3.out'},
        onComplete: () => {
          raizHtml.classList.remove('intro-ativa');
          raizHtml.classList.add('intro-vista');
          // A marca é gravada no fim, não no começo: em desenvolvimento o
          // StrictMode monta o efeito duas vezes, e gravar na entrada fazia a
          // segunda montagem achar que o prólogo já tinha sido visto — a
          // cortina nunca aparecia.
          sessionStorage.setItem(CHAVE_INTRO, '1');
          gsap.set('[data-prologo]', {display: 'none'});
          montarOrigem();
        },
      });

      intro
        .to('[data-intro-linha]', {yPercent: 0, duration: 0.4, stagger: 0.16})
        .fromTo(
          '[data-intro-cidade]',
          {letterSpacing: '0.34em'},
          {letterSpacing: '0.22em', duration: 0.4},
          0.28,
        )
        // Aqui a linha nasce. É a mesma que o scroll vai esticar depois.
        .fromTo(
          '[data-regua]',
          {width: '0vw'},
          {width: '34vw', duration: 0.56, ease: 'power2.inOut'},
          0.72,
        )
        .to('[data-prologo]', {opacity: 0, scale: 0.96, duration: 0.32}, 1.28);

      return () => {
        raizHtml.classList.remove('intro-ativa');
        intro.kill();
        ScrollTrigger.getById(CENAS.origem)?.kill();
      };
    },
    {scope: raiz, dependencies: [ativo], revertOnUpdate: true},
  );

  return (
    <section className="cena cena-origem" id="origem" ref={raiz}>
      <div className="cena-palco" data-palco="">
        <div className="origem-ceu" data-ceu="" aria-hidden="true" />
        <div className="origem-terra" data-terra="" aria-hidden="true" />
        <div className="origem-halo" data-halo="" aria-hidden="true" />

        {/* A linha. Um elemento só, do primeiro quadro do prólogo ao
            horizonte da origem. */}
        <i className="origem-regua" data-regua="" aria-hidden="true">
          <i className="origem-regua-brilho" data-regua-brilho="" />
        </i>

        {/* Prólogo: decorativo, sem foco. O h1 real da página vive no hero e
            já está no HTML servido, atrás desta camada. */}
        <div className="prologo" data-prologo="" aria-hidden="true">
          <span className="prologo-linha">
            <span data-intro-linha="">{PROLOGO.linhas[0]}</span>
          </span>
          <span className="prologo-linha prologo-cidade" data-intro-cidade="">
            <span data-intro-linha="">{PROLOGO.linhas[1]}</span>
          </span>
          <span className="prologo-linha prologo-ano">
            <span data-intro-linha="">{PROLOGO.linhas[2]}</span>
          </span>
        </div>

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
